from typing import Dict, List, Optional, Any

import openai
from fastapi import BackgroundTasks

from backend.LLM_Bundle.Azure_LLM import AzureOpenAIConfig
from backend.agent_managers.feedback import FeedbackManager
from backend.agent_managers.git_merge import GitMergeAgent
from backend.agent_managers.pattern import PatternExtractor
from backend.db.models.agent_orchestration import AgentOrchestrationTask, AgentTaskResult
from backend.db.services.agent_orchestration import AgentOrchestrationService
from backend.log import logger
from backend.prompts import SYSTEM_PROMPTS
from backend.schemas.code_request import CodeRequest
import re

config = AzureOpenAIConfig()

client = openai.AzureOpenAI(
    api_key=config.api_key,
    api_version=config.api_version,
    azure_endpoint=config.endpoint
)


class AgentOrchestrator:
    def __init__(self):
        self.git_merge_agent = GitMergeAgent()
        self.pattern_extractor = PatternExtractor()
        self.feedback_manager = FeedbackManager()

        # Định nghĩa các chuỗi agent mặc định cho từng loại task
        self.default_agent_chains = {
            "git_merge": [
                {"agent_type": "git_analyzer", "description": "Analyze git repository and conflicts"},
                {"agent_type": "code_understander", "description": "Understand code context and purpose"},
                {"agent_type": "conflict_resolver", "description": "Resolve merge conflicts"}
            ],
            "code_generation": [
                {"agent_type": "requirements_analyzer", "description": "Analyze requirements and extract key points"},
                {"agent_type": "code_generator", "description": "Generate initial code based on requirements"},
                {"agent_type": "code_optimizer", "description": "Optimize and improve generated code"}
            ],
            "code_optimization": [
                {"agent_type": "code_analyzer", "description": "Analyze existing code structure and patterns"},
                {"agent_type": "performance_optimizer", "description": "Optimize code for better performance"},
                {"agent_type": "quality_checker", "description": "Check code quality and suggest improvements"}
            ],
            "code_translation": [
                {"agent_type": "source_analyzer", "description": "Analyze source code and its patterns"},
                {"agent_type": "language_translator", "description": "Translate code to target language"},
                {"agent_type": "idiom_adapter", "description": "Adapt code to target language idioms"}
            ]
        }

    def _determine_agent_chain(self, task_type: str, custom_chain: Optional[List[Dict[str, Any]]] = None) -> List[
        Dict[str, Any]]:
        """
        Xác định chuỗi agent cho task

        Args:
            task_type: Loại task
            custom_chain: Chuỗi agent tùy chỉnh (nếu có)

        Returns:
            Chuỗi agent đã được xác định
        """
        if custom_chain:
            return custom_chain

        return self.default_agent_chains.get(task_type, [
            {"agent_type": "general_analyzer", "description": "Analyze input data"},
            {"agent_type": "task_executor", "description": "Execute the specified task"},
            {"agent_type": "quality_checker", "description": "Check the quality of the output"}
        ])

    def _select_next_agent(self, task: AgentOrchestrationTask) -> Optional[Dict[str, Any]]:
        """
        Chọn agent tiếp theo trong chuỗi

        Args:
            task: Task hiện tại

        Returns:
            Thông tin agent tiếp theo hoặc None nếu đã hoàn thành
        """
        if task.current_agent_index >= len(task.agent_chain):
            return None

        return task.agent_chain[task.current_agent_index]

    def _parse_agent_result(self, agent_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Phân tích kết quả từ agent để chuẩn bị cho agent tiếp theo
        """
        # Tạo bản sao để tránh thay đổi dữ liệu gốc
        parsed_result = agent_result.copy()

        # Xử lý kết quả từ code_generator
        if 'generated_code' in agent_result:
            # Extract code từ generated_code
            code_match = re.search(r'```python\s+(.*?)\s+```', agent_result['generated_code'], re.DOTALL)
            if code_match:
                parsed_result['code'] = code_match.group(1)
            else:
                parsed_result['code'] = agent_result['generated_code']

        # Xử lý kết quả từ requirements_analyzer
        if 'result_text' in agent_result and 'description' not in parsed_result:
            parsed_result['description'] = agent_result['result_text']

        # Truyền language nếu có
        if 'language' in agent_result:
            parsed_result['language_from'] = agent_result['language']
            parsed_result['language_to'] = agent_result['language']

        # Tìm language trong result_text nếu có
        if 'result_text' in agent_result:
            language_match = re.search(r'"language":\s*"(\w+)"', agent_result['result_text'])
            if language_match:
                parsed_result['language_from'] = language_match.group(1)
                parsed_result['language_to'] = language_match.group(1)

        return parsed_result

    async def decide_next_agent(self, task_id: str, current_result: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Quyết định agent tiếp theo cho task

        Args:
            task_id: ID của task
            current_result: Kết quả từ agent hiện tại

        Returns:
            Thông tin về agent tiếp theo
        """
        from backend.db.base import engine
        from sqlmodel import Session

        with Session(engine) as session:
            service = AgentOrchestrationService(session)

            # Lấy thông tin task
            task = service.get_task(task_id)
            if not task:
                return {"status": "error", "message": "Task not found"}

            # Nếu có kết quả từ agent hiện tại, lưu lại
            if current_result:
                result = AgentTaskResult(
                    task_id=task_id,
                    agent_type=task.agent_chain[task.current_agent_index]["agent_type"],
                    result_data=current_result,
                    meta_info={"agent_index": task.current_agent_index}
                )
                service.add_task_result(result)

            # Tăng index để chuyển sang agent tiếp theo
            next_index = task.current_agent_index + 1
            service.update_task(task_id, current_agent_index=next_index)

            # Lấy agent tiếp theo
            next_agent = self._select_next_agent(task)

            if not next_agent:
                # Đã hoàn thành tất cả các agent
                service.update_task(
                    task_id,
                    status="completed",
                    output_data=current_result or {}
                )
                return {"status": "completed", "message": "All agents completed"}

            return {"status": "continue", "next_agent": next_agent, "task": task.dict()}

    async def execute_agent(self, task_id: str, agent_type: str, input_data: Dict[str, Any],
                            background_tasks: BackgroundTasks) -> Dict[str, Any]:
        """
        Thực thi agent cho task

        Args:
            task_id: ID của task
            agent_type: Loại agent cần thực thi
            input_data: Dữ liệu đầu vào
            background_tasks: Background tasks

        Returns:
            Kết quả từ agent
        """
        # Implement agent execution based on agent_type
        if agent_type.startswith("git_"):
            return await self._execute_git_agent(task_id, agent_type, input_data, background_tasks)
        elif agent_type.startswith("code_"):
            return await self._execute_code_agent(task_id, agent_type, input_data)
        else:
            return await self._execute_general_agent(task_id, agent_type, input_data)

    async def _execute_git_agent(self, task_id: str, agent_type: str, input_data: Dict[str, Any],
                                 background_tasks: BackgroundTasks) -> Dict[str, Any]:
        """
        Thực thi agent liên quan đến git

        Args:
            task_id: ID của task
            agent_type: Loại agent cần thực thi
            input_data: Dữ liệu đầu vào
            background_tasks: Background tasks

        Returns:
            Kết quả từ agent
        """
        from backend.db.base import engine
        from sqlmodel import Session

        result = {"status": "error", "message": "Unknown git agent type"}

        with Session(engine) as session:
            if agent_type == "git_analyzer":
                # Start git merge session
                session_id = await self.git_merge_agent.start_merge_session(
                    input_data["user_id"],
                    input_data["repository_url"],
                    input_data["base_branch"],
                    input_data["target_branch"],
                    background_tasks,
                    session
                )

                result = {
                    "status": "success",
                    "session_id": session_id,
                    "message": "Git repository analysis started"
                }

            elif agent_type == "conflict_resolver":
                # Resolve conflicts
                if "conflict_id" in input_data and "resolved_content" in input_data:
                    success = await self.git_merge_agent.resolve_conflict(
                        input_data["conflict_id"],
                        input_data["resolved_content"],
                        input_data.get("resolution_strategy", "custom"),
                        session
                    )

                    result = {
                        "status": "success" if success else "error",
                        "message": "Conflict resolved" if success else "Failed to resolve conflict"
                    }

            elif agent_type == "merge_completer":
                # Complete merge
                if "session_id" in input_data:
                    success = await self.git_merge_agent.complete_merge(
                        input_data["session_id"],
                        background_tasks,
                        session
                    )

                    result = {
                        "status": "success" if success else "error",
                        "message": "Merge process started" if success else "Failed to start merge process"
                    }

        return result

    async def _execute_code_agent(self, task_id: str, agent_type: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Thực thi agent liên quan đến code

        Args:
            task_id: ID của task
            agent_type: Loại agent cần thực thi
            input_data: Dữ liệu đầu vào

        Returns:
            Kết quả từ agent
        """
        from backend.db.base import get_session
        from fastapi import BackgroundTasks

        result = {"status": "error", "message": "Unknown code agent type"}

        # Tạo một BackgroundTasks trống (sẽ không được sử dụng trong thực tế)
        background_tasks = BackgroundTasks()

        # Lấy session
        session_generator = get_session()
        session = next(session_generator)

        try:
            from backend.ai import process_code_request

            if agent_type == "code_generator":
                # Tạo code request
                code_request = CodeRequest(
                    action="generate",
                    description=input_data.get("description", "Generated from requirements analysis")
                                or "Generated from requirements analysis",
                    language_to=input_data.get("language_to", "python"),
                    user_id=input_data.get("user_id"),
                    comments=input_data.get("comments", True)
                )

                # Thực thi process_code_request
                response = await process_code_request("generate", code_request, background_tasks, session)

                result = {
                    "status": "success",
                    "message": "Code generated successfully",
                    "generated_code": response.result
                }

            elif agent_type == "code_optimizer":
                # Tạo code request
                code_request = CodeRequest(
                    action="optimize",
                    code=input_data.get("code", "No code provided") or "No code provided",
                    language_from=input_data.get("language_from", "python"),
                    optimization_level=input_data.get("optimization_level", "medium"),
                    user_id=input_data.get("user_id")
                )

                # Thực thi process_code_request
                response = await process_code_request("optimize", code_request, background_tasks, session)

                result = {
                    "status": "success",
                    "message": "Code optimized successfully",
                    "optimized_code": response.result
                }

            elif agent_type == "code_translator":
                # Tạo code request
                code_request = CodeRequest(
                    action="translate",
                    code=input_data.get("code", "No code provided") or "No code provided",
                    language_from=input_data.get("language_from", "python"),
                    language_to=input_data.get("language_to", "javascript"),
                    user_id=input_data.get("user_id")
                )

                # Thực thi process_code_request
                response = await process_code_request("translate", code_request, background_tasks, session)

                result = {
                    "status": "success",
                    "message": "Code translated successfully",
                    "translated_code": response.result
                }

            elif agent_type == "code_explainer":
                # Tạo code request
                code_request = CodeRequest(
                    action="explain",
                    code=input_data.get("code", "No code provided") or "No code provided",
                    language_from=input_data.get("language_from", "python"),
                    user_id=input_data.get("user_id")
                )

                # Thực thi process_code_request
                response = await process_code_request("explain", code_request, background_tasks, session)

                result = {
                    "status": "success",
                    "message": "Code explained successfully",
                    "explanation": response.result
                }
        except Exception as e:
            logger.error(f"Error executing code agent: {str(e)}")
            result = {"status": "error", "message": f"Error executing code agent: {str(e)}"}
        finally:
            # Đóng session
            session_generator.close()

        return result

    async def _execute_general_agent(self, task_id: str, agent_type: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Thực thi agent tổng quát

        Args:
            task_id: ID của task
            agent_type: Loại agent cần thực thi
            input_data: Dữ liệu đầu vào

        Returns:
            Kết quả từ agent
        """
        try:
            # Sử dụng LLM để xử lý task
            prompt = f"You are a {agent_type} agent. Your task is to {input_data.get('description', 'process the input data')}.\n\n"
            prompt += f"Input data: {input_data}\n\n"
            prompt += "Analyze this data and provide the result in a structured JSON format."

            response = client.chat.completions.create(
                model=config.deployment_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPTS.get("general", "You are a helpful AI assistant.")},
                    {"role": "user", "content": prompt}
                ],
                temperature=0
            )

            result_text = response.choices[0].message.content

            # Try to parse as JSON, but fall back to text if that fails
            try:
                import json
                result_json = json.loads(result_text)
                result = {
                    "status": "success",
                    "message": f"Task completed by {agent_type}",
                    "result": result_json
                }
            except json.JSONDecodeError:
                result = {
                    "status": "success",
                    "message": f"Task completed by {agent_type}",
                    "result_text": result_text
                }

        except Exception as e:
            logger.error(f"Error executing general agent: {str(e)}")
            result = {"status": "error", "message": f"Error executing general agent: {str(e)}"}

        return result

    async def start_orchestration(self, user_id: str, task_type: str, input_data: Dict[str, Any],
                                  agent_chain: Optional[List[Dict[str, Any]]] = None,
                                  session=None) -> str:
        """
        Bắt đầu orchestration task mới

        Args:
            user_id: ID của người dùng
            task_type: Loại task
            input_data: Dữ liệu đầu vào
            agent_chain: Chuỗi agent tùy chỉnh (nếu có)
            session: SQLAlchemy session (nếu có)

        Returns:
            ID của task orchestration
        """
        # Xác định chuỗi agent
        chain = self._determine_agent_chain(task_type, agent_chain)

        # Tạo task mới
        task = AgentOrchestrationTask(
            user_id=user_id,
            task_type=task_type,
            status="pending",
            input_data=input_data,
            agent_chain=chain,
            current_agent_index=0
        )

        # Lưu task vào database
        if session:
            service = AgentOrchestrationService(session)
        else:
            from backend.db.base import engine
            from sqlmodel import Session
            with Session(engine) as new_session:
                service = AgentOrchestrationService(new_session)

        task_id = service.create_task(task)

        return task_id

    async def run_orchestration(self, task_id: str, background_tasks: BackgroundTasks):
        """
        Chạy orchestration task

        Args:
            task_id: ID của task
            background_tasks: Background tasks
        """
        background_tasks.add_task(
            self._run_orchestration_task,
            task_id
        )

    async def _run_orchestration_task(self, task_id: str):
        """
        Task thực thi orchestration

        Args:
            task_id: ID của task
        """
        from backend.db.base import engine
        from sqlmodel import Session
        from fastapi import BackgroundTasks

        background_tasks = BackgroundTasks()

        with Session(engine) as session:
            service = AgentOrchestrationService(session)

            # Lấy thông tin task
            task = service.get_task(task_id)
            if not task:
                logger.error(f"Task not found: {task_id}")
                return

            # Cập nhật trạng thái
            service.update_task(task_id, status="in_progress")

            # Dữ liệu đầu vào ban đầu
            input_data = task.input_data

            # Chạy từng agent trong chuỗi
            for i, agent in enumerate(task.agent_chain):
                try:
                    # Cập nhật index agent hiện tại
                    service.update_task(task_id, current_agent_index=i)

                    # Thực thi agent
                    agent_type = agent["agent_type"]
                    agent_result = await self.execute_agent(task_id, agent_type, input_data, background_tasks)

                    # Lưu kết quả
                    result = AgentTaskResult(
                        task_id=task_id,
                        agent_type=agent_type,
                        result_data=agent_result,
                        meta_info={"agent_index": i}
                    )
                    service.add_task_result(result)

                    # Kiểm tra trạng thái
                    if agent_result.get("status") == "error":
                        service.update_task(
                            task_id,
                            status="failed",
                            error_message=agent_result.get("message", "Unknown error")
                        )
                        return

                    # Chuẩn bị dữ liệu đầu vào cho agent tiếp theo
                    input_data = self._parse_agent_result(agent_result)

                except Exception as e:
                    logger.error(f"Error executing agent {agent_type}: {str(e)}")
                    service.update_task(
                        task_id,
                        status="failed",
                        error_message=f"Error executing agent {agent_type}: {str(e)}"
                    )
                    return

            # Hoàn thành tất cả các agent
            service.update_task(
                task_id,
                status="completed",
                output_data=input_data
            )

    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """
        Lấy trạng thái của task

        Args:
            task_id: ID của task

        Returns:
            Thông tin trạng thái của task
        """
        from backend.db.base import engine
        from sqlmodel import Session

        with Session(engine) as session:
            service = AgentOrchestrationService(session)

            # Lấy thông tin task
            task = service.get_task(task_id)
            if not task:
                return {"status": "error", "message": "Task not found"}

            # Lấy danh sách kết quả
            results = service.get_task_results(task_id)

            return {
                "task_id": task.id,
                "status": task.status,
                "task_type": task.task_type,
                "current_agent_index": task.current_agent_index,
                "total_agents": len(task.agent_chain),
                "error_message": task.error_message,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat(),
                "results": [
                    {
                        "agent_type": r.agent_type,
                        "result_data": r.result_data,
                        "created_at": r.created_at.isoformat()
                    }
                    for r in results
                ]
            }

    async def abort_task(self, task_id: str, reason: Optional[str] = None) -> bool:
        """
        Hủy bỏ task

        Args:
            task_id: ID của task
            reason: Lý do hủy bỏ

        Returns:
            True nếu thành công, False nếu thất bại
        """
        from backend.db.base import engine
        from sqlmodel import Session

        with Session(engine) as session:
            service = AgentOrchestrationService(session)

            # Lấy thông tin task
            task = service.get_task(task_id)
            if not task:
                return False

            # Cập nhật trạng thái
            service.update_task(
                task_id,
                status="aborted",
                error_message=reason or "Task aborted by user"
            )

            return True
