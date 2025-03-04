import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime
from fastapi import BackgroundTasks

from backend.agent_managers.pattern import PatternExtractor
from backend.agent_managers.git_merge import GitMergeAgent
from backend.agent_managers.feedback import FeedbackManager
from backend.db.models.workflow import (
    Workflow, WorkflowNode, WorkflowEdge,
    WorkflowExecution, WorkflowExecutionStep
)
from backend.db.services.workflow import WorkflowService
from backend.log import logger


class WorkflowOrchestrator:
    def __init__(self):
        self.git_merge_agent = GitMergeAgent()
        self.pattern_extractor = PatternExtractor()
        self.feedback_manager = FeedbackManager()

        # Danh sách các agent có sẵn
        self.available_agents = {
            # Code related agents
            "requirements_analyzer": {
                "name": "Requirements Analyzer",
                "description": "Analyzes requirements and extracts key points",
                "category": "code",
                "inputs": ["description"],
                "outputs": ["analyzed_requirements"]
            },
            "code_generator": {
                "name": "Code Generator",
                "description": "Generates code based on requirements or specifications",
                "category": "code",
                "inputs": ["description", "language"],
                "outputs": ["generated_code"]
            },
            "code_optimizer": {
                "name": "Code Optimizer",
                "description": "Optimizes and improves generated code",
                "category": "code",
                "inputs": ["code", "optimization_level"],
                "outputs": ["optimized_code"]
            },
            "code_analyzer": {
                "name": "Code Analyzer",
                "description": "Analyzes existing code structure and patterns",
                "category": "code",
                "inputs": ["code"],
                "outputs": ["code_analysis"]
            },
            "performance_optimizer": {
                "name": "Performance Optimizer",
                "description": "Optimizes code for better performance",
                "category": "code",
                "inputs": ["code"],
                "outputs": ["optimized_code"]
            },
            "quality_checker": {
                "name": "Quality Checker",
                "description": "Checks code quality and suggests improvements",
                "category": "code",
                "inputs": ["code"],
                "outputs": ["quality_report"]
            },
            "language_translator": {
                "name": "Language Translator",
                "description": "Translates code from one language to another",
                "category": "code",
                "inputs": ["code", "source_language", "target_language"],
                "outputs": ["translated_code"]
            },

            # Git related agents
            "git_analyzer": {
                "name": "Git Analyzer",
                "description": "Analyzes git repository and conflicts",
                "category": "git",
                "inputs": ["repository_url", "base_branch", "target_branch"],
                "outputs": ["repository_analysis"]
            },
            "code_understander": {
                "name": "Code Understander",
                "description": "Understands code context and purpose",
                "category": "git",
                "inputs": ["code", "file_path"],
                "outputs": ["code_understanding"]
            },
            "conflict_resolver": {
                "name": "Conflict Resolver",
                "description": "Resolves merge conflicts",
                "category": "git",
                "inputs": ["conflict_content", "file_path"],
                "outputs": ["resolved_conflict"]
            },

            # General agents
            "general_analyzer": {
                "name": "General Analyzer",
                "description": "Analyzes input data",
                "category": "general",
                "inputs": ["input_data"],
                "outputs": ["analysis_result"]
            },
            "task_executor": {
                "name": "Task Executor",
                "description": "Executes the specified task",
                "category": "general",
                "inputs": ["task_description", "input_data"],
                "outputs": ["execution_result"]
            },
            "data_formatter": {
                "name": "Data Formatter",
                "description": "Formats data into specified format",
                "category": "general",
                "inputs": ["data", "target_format"],
                "outputs": ["formatted_data"]
            }
        }

    def get_available_agents(self) -> Dict[str, Dict[str, Any]]:
        """Lấy danh sách các agent có sẵn"""
        return self.available_agents

    def get_agent_details(self, agent_type: str) -> Optional[Dict[str, Any]]:
        """Lấy thông tin chi tiết của một agent"""
        return self.available_agents.get(agent_type)

    async def create_workflow(self, user_id: str, name: str, description: Optional[str] = None, session=None) -> str:
        """
        Tạo một workflow mới

        Args:
            user_id: ID của người dùng
            name: Tên workflow
            description: Mô tả workflow
            session: SQLAlchemy session (nếu có)

        Returns:
            ID của workflow đã tạo
        """
        if session:
            workflow_service = WorkflowService(session)
        else:
            from backend.db.base import engine
            from sqlmodel import Session
            with Session(engine) as new_session:
                workflow_service = WorkflowService(new_session)

        workflow = Workflow(
            user_id=user_id,
            name=name,
            description=description
        )

        workflow_id = workflow_service.create_workflow(workflow)
        return workflow_id

    async def execute_workflow(self, workflow_id: str, user_id: str, input_data: Dict[str, Any],
                               background_tasks: BackgroundTasks, session=None) -> str:
        """
        Thực thi một workflow

        Args:
            workflow_id: ID của workflow
            user_id: ID của người dùng
            input_data: Dữ liệu đầu vào
            background_tasks: Background tasks
            session: SQLAlchemy session (nếu có)

        Returns:
            ID của lần thực thi workflow
        """
        if session:
            workflow_service = WorkflowService(session)
        else:
            from backend.db.base import engine
            from sqlmodel import Session
            with Session(engine) as new_session:
                workflow_service = WorkflowService(new_session)

        # Kiểm tra workflow tồn tại
        workflow = workflow_service.get_workflow(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow with ID {workflow_id} does not exist")

        # Tạo execution mới
        execution = WorkflowExecution(
            workflow_id=workflow_id,
            user_id=user_id,
            status="pending",
            input_data=input_data
        )

        execution_id = workflow_service.create_execution(execution)

        # Chạy workflow trong background
        background_tasks.add_task(
            self._execute_workflow_task,
            execution_id,
            workflow_id,
            input_data
        )

        return execution_id

    async def _execute_workflow_task(self, execution_id: str, workflow_id: str, input_data: Dict[str, Any]):
        """
        Task thực thi workflow

        Args:
            execution_id: ID của lần thực thi
            workflow_id: ID của workflow
            input_data: Dữ liệu đầu vào
        """
        from backend.db.base import engine
        from sqlmodel import Session

        with Session(engine) as session:
            workflow_service = WorkflowService(session)

            # Cập nhật trạng thái
            workflow_service.update_execution(
                execution_id,
                status="in_progress"
            )

            try:
                # Lấy thông tin workflow
                workflow = workflow_service.get_workflow(workflow_id)
                if not workflow:
                    raise ValueError(f"Workflow with ID {workflow_id} does not exist")

                # Lấy nodes và edges
                nodes = workflow_service.get_workflow_nodes(workflow_id)
                edges = workflow_service.get_workflow_edges(workflow_id)

                if not nodes:
                    raise ValueError("Workflow does not have any nodes")

                # Tạo graph từ nodes và edges
                graph = self._build_execution_graph(nodes, edges)

                # Tìm các node bắt đầu (không có node nào trỏ đến)
                start_nodes = self._find_start_nodes(graph)

                if not start_nodes:
                    raise ValueError("Cannot determine starting nodes for workflow")

                # Thực thi workflow
                result = await self._execute_graph(graph, start_nodes, input_data, execution_id, workflow_service)

                # Cập nhật kết quả và trạng thái
                workflow_service.update_execution(
                    execution_id,
                    status="completed",
                    output_data=result,
                    completed_at=datetime.now()
                )

            except Exception as e:
                logger.error(f"Error executing workflow: {str(e)}")
                workflow_service.update_execution(
                    execution_id,
                    status="failed",
                    error_message=str(e),
                    completed_at=datetime.now()
                )

    def _build_execution_graph(self, nodes: List[WorkflowNode], edges: List[WorkflowEdge]) -> Dict[str, Dict[str, Any]]:
        """
        Xây dựng đồ thị thực thi từ nodes và edges

        Args:
            nodes: Danh sách các node
            edges: Danh sách các edge

        Returns:
            Đồ thị dưới dạng dictionary
        """
        graph = {}

        # Thêm tất cả nodes vào graph
        for node in nodes:
            graph[node.id] = {
                "data": node,
                "next": [],
                "executed": False,
                "result": None
            }

        # Thêm edges
        for edge in edges:
            source_id = edge.source_id
            target_id = edge.target_id

            if source_id in graph:
                graph[source_id]["next"].append({
                    "target_id": target_id,
                    "edge_type": edge.edge_type,
                    "conditions": edge.conditions
                })

        return graph

    def _find_start_nodes(self, graph: Dict[str, Dict[str, Any]]) -> List[str]:
        """
        Tìm các node bắt đầu (không có node nào trỏ đến)

        Args:
            graph: Đồ thị workflow

        Returns:
            Danh sách ID của các node bắt đầu
        """
        # Tạo set chứa tất cả các node đích
        target_nodes = set()
        for node_id, node_data in graph.items():
            for next_node in node_data["next"]:
                target_nodes.add(next_node["target_id"])

        # Nodes không nằm trong target_nodes là start nodes
        start_nodes = []
        for node_id in graph.keys():
            if node_id not in target_nodes:
                start_nodes.append(node_id)

        return start_nodes

    async def _execute_graph(self, graph: Dict[str, Dict[str, Any]], current_nodes: List[str],
                             data: Dict[str, Any], execution_id: str, workflow_service: WorkflowService) -> Dict[
        str, Any]:
        """
        Thực thi đồ thị workflow

        Args:
            graph: Đồ thị workflow
            current_nodes: Danh sách ID của các node cần thực thi
            data: Dữ liệu đầu vào
            execution_id: ID của lần thực thi
            workflow_service: Service để thao tác với database

        Returns:
            Kết quả thực thi
        """
        result = {}

        # Nếu không còn node nào để thực thi, kết thúc
        if not current_nodes:
            return result

        next_nodes = []

        # Thực thi tất cả các node hiện tại
        for node_id in current_nodes:
            if node_id not in graph or graph[node_id]["executed"]:
                continue

            node = graph[node_id]["data"]

            # Tạo step execution mới
            step = WorkflowExecutionStep(
                execution_id=execution_id,
                node_id=node.id,
                status="in_progress",
                input_data=data
            )

            step_id = workflow_service.add_execution_step(step)

            try:
                # Thực thi node
                node_result = await self._execute_node(node, data)

                # Cập nhật trạng thái của node trong graph
                graph[node_id]["executed"] = True
                graph[node_id]["result"] = node_result

                # Cập nhật kết quả chung
                result.update(node_result)

                # Cập nhật step execution
                workflow_service.update_execution_step(
                    step_id,
                    status="completed",
                    output_data=node_result,
                    completed_at=datetime.now()
                )

                # Tìm các node tiếp theo
                for next_node in graph[node_id]["next"]:
                    target_id = next_node["target_id"]
                    edge_type = next_node["edge_type"]
                    conditions = next_node["conditions"]

                    # Kiểm tra điều kiện (nếu có)
                    if self._check_edge_conditions(conditions, node_result):
                        next_nodes.append(target_id)

            except Exception as e:
                logger.error(f"Error executing node {node.name}: {str(e)}")

                # Cập nhật step execution
                workflow_service.update_execution_step(
                    step_id,
                    status="failed",
                    error_message=str(e),
                    completed_at=datetime.now()
                )

                # Nếu edge_type là "default", node tiếp theo vẫn sẽ được thực thi
                # Nếu edge_type là failure, chỉ thực thi node tiếp theo khi có lỗi
                for next_node in graph[node_id]["next"]:
                    if next_node["edge_type"] == "failure":
                        next_nodes.append(next_node["target_id"])

        # Thực thi đệ quy các node tiếp theo
        next_result = await self._execute_graph(graph, next_nodes, result, execution_id, workflow_service)
        result.update(next_result)

        return result

    def _check_edge_conditions(self, conditions: Dict[str, Any], result: Dict[str, Any]) -> bool:
        """
        Kiểm tra điều kiện của edge

        Args:
            conditions: Điều kiện cần kiểm tra
            result: Kết quả node

        Returns:
            True nếu thỏa mãn điều kiện, False nếu không
        """
        # Nếu không có điều kiện, luôn trả về True
        if not conditions:
            return True

        # TODO: Implement logic to check conditions
        # Ví dụ: Kiểm tra có key trong result không, giá trị có bằng giá trị mong muốn không, v.v.

        return True

    async def _execute_node(self, node: WorkflowNode, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Thực thi một node

        Args:
            node: Node cần thực thi
            data: Dữ liệu đầu vào

        Returns:
            Kết quả thực thi
        """
        node_type = node.node_type

        # Trích xuất các tham số từ data và config của node
        params = {}
        params.update(data)
        params.update(node.config)

        # Thực thi agent tương ứng
        from backend.db.base import engine
        from sqlmodel import Session
        from fastapi import BackgroundTasks

        background_tasks = BackgroundTasks()

        with Session(engine) as session:
            try:
                from backend.agent_managers.orchestrator import AgentOrchestrator
                orchestrator = AgentOrchestrator()

                # Sử dụng lại các agent logic đã có
                result = await orchestrator.execute_agent(
                    task_id=str(uuid.uuid4()),  # Generate a temporary task ID
                    agent_type=node_type,
                    input_data=params,
                    background_tasks=background_tasks
                )

                return result
            except Exception as e:
                logger.error(f"Error executing agent {node_type}: {str(e)}")
                raise