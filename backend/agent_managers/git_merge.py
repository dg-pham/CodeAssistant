import re
import uuid
import tempfile
import os
import shutil
from typing import List, Dict, Optional, Tuple
from fastapi import BackgroundTasks

import openai
from backend.LLM_Bundle.Azure_LLM import AzureOpenAIConfig
from backend.db.models.git_merge import GitMergeSession, GitMergeConflict
from backend.db.services.git_merge import GitMergeService
from backend.log import logger
from backend.prompts import SYSTEM_PROMPTS
from sqlmodel import Session

config = AzureOpenAIConfig()

client = openai.AzureOpenAI(
    api_key=config.api_key,
    api_version=config.api_version,
    azure_endpoint=config.endpoint
)


class GitMergeAgent:
    def __init__(self):
        pass

    def _extract_conflict_markers(self, content: str) -> List[Dict]:
        """
        Trích xuất các đánh dấu xung đột từ nội dung file

        Args:
            content: Nội dung file có xung đột

        Returns:
            List của các xung đột, mỗi xung đột chứa vị trí bắt đầu, kết thúc,
            phần nội dung xung đột đầy đủ, phần của chúng ta và phần của họ
        """
        conflicts = []

        # Regex pattern để bắt các marker xung đột
        pattern = r"<<<<<<< HEAD(.*?)=======\n(.*?)>>>>>>> (.*?)(?=\n<<<<<<< HEAD|\Z)"

        for match in re.finditer(pattern, content, re.DOTALL):
            conflict = {
                "our_content": match.group(1).strip(),
                "their_content": match.group(2).strip(),
                "branch_name": match.group(3).strip(),
                "full_content": match.group(0),
                "start": match.start(),
                "end": match.end()
            }
            conflicts.append(conflict)

        return conflicts

    def _clone_repository(self, repo_url: str, base_branch: str, target_branch: str) -> Tuple[str, List[str]]:
        """
        Clone repository và lấy danh sách file xung đột

        Args:
            repo_url: URL của repository
            base_branch: Branch cơ sở
            target_branch: Branch đích

        Returns:
            Đường dẫn đến repository đã clone và danh sách file xung đột
        """
        try:
            # Requires GitPython package
            import git

            # Tạo thư mục tạm thời
            temp_dir = tempfile.mkdtemp()

            # Clone repository
            repo = git.Repo.clone_from(repo_url, temp_dir)

            # Checkout branch cơ sở
            repo.git.checkout(base_branch)

            # Tạo branch tạm thời cho merge
            temp_branch = f"temp_merge_{uuid.uuid4().hex[:8]}"
            repo.git.checkout('-b', temp_branch)

            # Thử merge branch đích
            conflicted_files = []
            try:
                repo.git.merge(target_branch)
            except git.GitCommandError as e:
                # Lấy danh sách file xung đột
                if "CONFLICT" in str(e):
                    output = repo.git.status()
                    # Parse output to get conflicted files
                    for line in output.split('\n'):
                        if "both modified:" in line:
                            filename = line.split("both modified:")[1].strip()
                            conflicted_files.append(filename)

            return temp_dir, conflicted_files
        except Exception as e:
            logger.error(f"Error cloning repository: {str(e)}")
            # Clean up
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
            raise

    def _get_file_content(self, repo_path: str, file_path: str) -> str:
        """
        Lấy nội dung file từ repository

        Args:
            repo_path: Đường dẫn đến repository
            file_path: Đường dẫn tương đối của file

        Returns:
            Nội dung của file
        """
        try:
            full_path = os.path.join(repo_path, file_path)
            with open(full_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading file content: {str(e)}")
            return ""

    def _get_file_context(self, repo_path: str, file_path: str) -> str:
        """
        Lấy thông tin bổ sung về file, như tên package, imports, v.v.

        Args:
            repo_path: Đường dẫn đến repository
            file_path: Đường dẫn tương đối của file

        Returns:
            Thông tin bổ sung về file
        """
        # Get file extension
        _, ext = os.path.splitext(file_path)

        # Get imports and package info based on file type
        imports = []
        package_info = ""

        try:
            content = self._get_file_content(repo_path, file_path)

            if ext == '.py':
                # Extract Python imports
                import_lines = re.findall(r'^import .*|^from .* import .*', content, re.MULTILINE)
                imports = import_lines

                # Look for class/function definitions
                definitions = re.findall(r'^(class|def) .*?:', content, re.MULTILINE)
                package_info = "\n".join(definitions[:5])  # First 5 definitions

            elif ext in ['.java', '.kt']:
                # Extract Java/Kotlin package
                package_match = re.search(r'^package (.*?);', content, re.MULTILINE)
                if package_match:
                    package_info = f"Package: {package_match.group(1)}"

                # Extract imports
                import_lines = re.findall(r'^import .*?;', content, re.MULTILINE)
                imports = import_lines

            elif ext in ['.js', '.ts']:
                # Extract JS/TS imports
                import_lines = re.findall(r'^import .*|^const .* require\(.*\)', content, re.MULTILINE)
                imports = import_lines

            # Combine the information
            context = f"File: {file_path}\n"
            if package_info:
                context += f"Package info: {package_info}\n"
            if imports:
                context += "Imports:\n" + "\n".join(imports[:10])  # First 10 imports

            return context

        except Exception as e:
            logger.error(f"Error getting file context: {str(e)}")
            return f"File: {file_path}"

    def _analyze_conflict(self, conflict_content: str, file_context: str = None) -> str:
        """
        Phân tích xung đột bằng cách sử dụng AI

        Args:
            conflict_content: Nội dung xung đột
            file_context: Ngữ cảnh của file

        Returns:
            Đề xuất giải quyết xung đột
        """
        try:
            context = "File context:" + file_context if file_context else ""

            response = client.chat.completions.create(
                model=config.deployment_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPTS["git_merge"]},
                    {"role": "user",
                     "content": f"Please analyze this git merge conflict and suggest a resolution:\n\n{conflict_content}\n\n{context}"}
                ],
                temperature=0
            )

            suggestion = response.choices[0].message.content
            return suggestion
        except Exception as e:
            logger.error(f"Error analyzing conflict: {str(e)}")
            return "Could not analyze conflict due to an error."

    def _resolve_conflict(self, conflict_content: str, resolution_content: str) -> str:
        """
        Giải quyết xung đột bằng cách thay thế nội dung xung đột

        Args:
            conflict_content: Nội dung xung đột đầy đủ
            resolution_content: Nội dung giải quyết

        Returns:
            Nội dung đã được giải quyết
        """
        # Basic implementation: replace the conflict with the resolution
        return resolution_content

    def _apply_resolution(self, file_content: str, conflict: Dict, resolution: str) -> str:
        """
        Áp dụng giải pháp cho xung đột vào nội dung file

        Args:
            file_content: Nội dung file đầy đủ
            conflict: Thông tin xung đột
            resolution: Nội dung giải quyết

        Returns:
            Nội dung file đã được cập nhật
        """
        # Replace the conflict with the resolution
        return file_content[:conflict["start"]] + resolution + file_content[conflict["end"]:]

    def _complete_merge(self, repo_path: str, base_branch: str) -> Optional[str]:
        """
        Hoàn thành merge và trả về kết quả

        Args:
            repo_path: Đường dẫn đến repository
            base_branch: Branch cơ sở

        Returns:
            Kết quả merge hoặc None nếu có lỗi
        """
        try:
            import git
            repo = git.Repo(repo_path)

            # Thử commit các giải quyết xung đột
            repo.git.add('.')
            repo.git.commit('-m', 'Resolve merge conflicts with AI assistance')

            # Lấy commit hash
            commit_hash = repo.head.commit.hexsha

            # Checkout lại branch cơ sở
            repo.git.checkout(base_branch)

            return commit_hash
        except Exception as e:
            logger.error(f"Error completing merge: {str(e)}")
            return None
        finally:
            # Xóa thư mục tạm thời
            if os.path.exists(repo_path):
                shutil.rmtree(repo_path)

    async def start_merge_session(self, user_id: str, repository_url: str,
                                  base_branch: str, target_branch: str,
                                  background_tasks: BackgroundTasks,
                                  session: Session) -> str:
        """
        Bắt đầu phiên merge git mới

        Args:
            user_id: ID của người dùng
            repository_url: URL của repository
            base_branch: Branch cơ sở
            target_branch: Branch đích
            background_tasks: Background tasks
            session: SQLAlchemy session

        Returns:
            ID của phiên merge git
        """
        # Tạo phiên merge git mới
        merge_service = GitMergeService(session)

        merge_session = GitMergeSession(
            user_id=user_id,
            repository_url=repository_url,
            base_branch=base_branch,
            target_branch=target_branch,
            status="pending"
        )

        session_id = merge_service.create_session(merge_session)

        # Thêm task phân tích xung đột vào background
        background_tasks.add_task(
            self._analyze_repository,
            session_id,
            repository_url,
            base_branch,
            target_branch,
            background_tasks
        )

        return session_id

    async def _analyze_repository(self, session_id: str, repository_url: str,
                                  base_branch: str, target_branch: str,
                                  background_tasks: BackgroundTasks):
        """
        Phân tích repository để tìm xung đột

        Args:
            session_id: ID của phiên merge git
            repository_url: URL của repository
            base_branch: Branch cơ sở
            target_branch: Branch đích
            background_tasks: Background tasks
        """
        from backend.db.base import engine
        from sqlmodel import Session

        with Session(engine) as db_session:
            merge_service = GitMergeService(db_session)

            # Cập nhật trạng thái
            merge_service.update_session(session_id, status="in_progress")

            try:
                # Clone repository và lấy danh sách file xung đột
                repo_path, conflicted_files = self._clone_repository(
                    repository_url, base_branch, target_branch
                )

                if not conflicted_files:
                    # Không có xung đột
                    merge_service.update_session(
                        session_id,
                        status="completed",
                        merge_result="No conflicts found. Merge completed successfully."
                    )
                    return

                # Xử lý từng file xung đột
                for file_path in conflicted_files:
                    # Lấy nội dung file và ngữ cảnh
                    file_content = self._get_file_content(repo_path, file_path)
                    file_context = self._get_file_context(repo_path, file_path)

                    # Trích xuất các đánh dấu xung đột
                    conflicts = self._extract_conflict_markers(file_content)

                    for conflict in conflicts:
                        # Tạo đối tượng xung đột
                        conflict_obj = GitMergeConflict(
                            session_id=session_id,
                            file_path=file_path,
                            conflict_content=conflict["full_content"],
                            our_changes=conflict["our_content"],
                            their_changes=conflict["their_content"],
                            is_resolved=False
                        )

                        # Lưu xung đột vào database
                        conflict_id = merge_service.add_conflict(conflict_obj)

                        # Phân tích xung đột trong background task
                        background_tasks.add_task(
                            self._analyze_conflict_task,
                            conflict_id,
                            conflict["full_content"],
                            file_context
                        )

                # Cập nhật trạng thái
                merge_service.update_session(
                    session_id,
                    status="analyzing_conflicts"
                )

            except Exception as e:
                logger.error(f"Error analyzing repository: {str(e)}")
                merge_service.update_session(
                    session_id,
                    status="failed",
                    merge_result=f"Failed to analyze repository: {str(e)}"
                )

    async def _analyze_conflict_task(self, conflict_id: str, conflict_content: str, file_context: str):
        """
        Task phân tích xung đột

        Args:
            conflict_id: ID của xung đột
            conflict_content: Nội dung xung đột
            file_context: Ngữ cảnh của file
        """
        from backend.db.base import engine
        from sqlmodel import Session

        with Session(engine) as db_session:
            merge_service = GitMergeService(db_session)

            try:
                # Phân tích xung đột
                suggestion = self._analyze_conflict(conflict_content, file_context)

                # Cập nhật xung đột với đề xuất
                merge_service.update_conflict(
                    conflict_id,
                    ai_suggestion=suggestion
                )

                # Kiểm tra xem tất cả xung đột đã được phân tích chưa
                conflict = merge_service.get_conflict(conflict_id)
                if conflict:
                    session = merge_service.get_session(conflict.session_id)
                    if session and session.status == "analyzing_conflicts":
                        conflicts = merge_service.get_session_conflicts(session.id)

                        all_analyzed = all(c.ai_suggestion is not None for c in conflicts)
                        if all_analyzed:
                            # Tất cả xung đột đã được phân tích
                            merge_service.update_session(
                                session.id,
                                status="ready_for_resolution"
                            )

            except Exception as e:
                logger.error(f"Error analyzing conflict: {str(e)}")

    async def resolve_conflict(self, conflict_id: str, resolved_content: str,
                               resolution_strategy: str, session: Session) -> bool:
        """
        Giải quyết xung đột

        Args:
            conflict_id: ID của xung đột
            resolved_content: Nội dung giải quyết
            resolution_strategy: Chiến lược giải quyết
            session: SQLAlchemy session

        Returns:
            True nếu thành công, False nếu thất bại
        """
        merge_service = GitMergeService(session)

        # Lấy thông tin xung đột
        conflict = merge_service.get_conflict(conflict_id)
        if not conflict:
            return False

        # Cập nhật xung đột
        updated_conflict = merge_service.update_conflict(
            conflict_id,
            resolved_content=resolved_content,
            resolution_strategy=resolution_strategy,
            is_resolved=True
        )

        if not updated_conflict:
            return False

        # Kiểm tra xem tất cả xung đột đã được giải quyết chưa
        merge_session = merge_service.get_session(conflict.session_id)
        if merge_session:
            conflicts = merge_service.get_session_conflicts(merge_session.id)

            all_resolved = all(c.is_resolved for c in conflicts)
            if all_resolved:
                # Tất cả xung đột đã được giải quyết
                merge_service.update_session(
                    merge_session.id,
                    status="ready_for_merge"
                )

        return True

    async def complete_merge(self, session_id: str, background_tasks: BackgroundTasks,
                             session: Session) -> bool:
        """
        Hoàn thành merge

        Args:
            session_id: ID của phiên merge git
            background_tasks: Background tasks
            session: SQLAlchemy session

        Returns:
            True nếu thành công, False nếu thất bại
        """
        merge_service = GitMergeService(session)

        # Lấy thông tin phiên merge
        merge_session = merge_service.get_session(session_id)
        if not merge_session or merge_session.status != "ready_for_merge":
            return False

        # Cập nhật trạng thái
        merge_service.update_session(
            session_id,
            status="merging"
        )

        # Thêm task hoàn thành merge vào background
        background_tasks.add_task(
            self._complete_merge_task,
            session_id,
            merge_session.repository_url,
            merge_session.base_branch,
            merge_session.target_branch
        )

        return True

    async def _complete_merge_task(self, session_id: str, repository_url: str,
                                   base_branch: str, target_branch: str):
        """
        Task hoàn thành merge

        Args:
            session_id: ID của phiên merge git
            repository_url: URL của repository
            base_branch: Branch cơ sở
            target_branch: Branch đích
        """
        from backend.db.base import engine
        from sqlmodel import Session

        with Session(engine) as db_session:
            merge_service = GitMergeService(db_session)

            try:
                # Clone repository
                import git
                temp_dir = tempfile.mkdtemp()
                repo = git.Repo.clone_from(repository_url, temp_dir)

                # Checkout branch cơ sở
                repo.git.checkout(base_branch)

                # Tạo branch tạm thời cho merge
                temp_branch = f"temp_merge_{uuid.uuid4().hex[:8]}"
                repo.git.checkout('-b', temp_branch)

                # Thử merge branch đích
                try:
                    repo.git.merge(target_branch)

                    # Nếu không có xung đột, merge đã thành công
                    merge_service.update_session(
                        session_id,
                        status="completed",
                        merge_result=f"Merge completed successfully. Commit hash: {repo.head.commit.hexsha}"
                    )
                    return
                except git.GitCommandError:
                    # Xung đột xảy ra, áp dụng các giải pháp
                    conflicts = merge_service.get_session_conflicts(session_id)

                    for conflict in conflicts:
                        if not conflict.is_resolved:
                            merge_service.update_session(
                                session_id,
                                status="failed",
                                merge_result="Not all conflicts have been resolved"
                            )
                            return

                        # Lấy nội dung file
                        file_path = conflict.file_path
                        file_path_full = os.path.join(temp_dir, file_path)

                        if os.path.exists(file_path_full):
                            with open(file_path_full, 'r', encoding='utf-8') as f:
                                content = f.read()

                            # Áp dụng giải pháp
                            if conflict.resolution_strategy == "ours":
                                # Giữ phần của chúng ta
                                new_content = content.replace(conflict.conflict_content, conflict.our_changes)
                            elif conflict.resolution_strategy == "theirs":
                                # Giữ phần của họ
                                new_content = content.replace(conflict.conflict_content, conflict.their_changes)
                            else:  # custom
                                # Sử dụng nội dung giải quyết tùy chỉnh
                                new_content = content.replace(conflict.conflict_content, conflict.resolved_content)

                            # Ghi lại nội dung đã sửa
                            with open(file_path_full, 'w', encoding='utf-8') as f:
                                f.write(new_content)

                    # Commit các giải pháp
                    repo.git.add('.')
                    repo.git.commit('-m', 'Resolve merge conflicts with AI assistance')

                    # Cập nhật trạng thái
                    merge_service.update_session(
                        session_id,
                        status="completed",
                        merge_result=f"Merge completed successfully. Commit hash: {repo.head.commit.hexsha}"
                    )
            except Exception as e:
                logger.error(f"Error completing merge: {str(e)}")
                merge_service.update_session(
                    session_id,
                    status="failed",
                    merge_result=f"Failed to complete merge: {str(e)}"
                )
            finally:
                # Xóa thư mục tạm thời
                if os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir)