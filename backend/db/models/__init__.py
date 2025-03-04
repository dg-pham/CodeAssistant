from backend.db.models.user import User
from backend.db.models.conversation import Conversation
from backend.db.models.message import Message
from backend.db.models.code_snippet import CodeSnippet
from backend.db.models.feedback import Feedback
from backend.db.models.memory import AgentMemory
from backend.db.models.git_merge import GitMergeSession, GitMergeConflict
from backend.db.models.agent_orchestration import AgentOrchestrationTask, AgentTaskResult
from backend.db.models.workflow import (
    Workflow, WorkflowNode, WorkflowEdge,
    WorkflowExecution, WorkflowExecutionStep
)


User.model_rebuild()
Conversation.model_rebuild()
Message.model_rebuild()
CodeSnippet.model_rebuild()
Feedback.model_rebuild()
AgentMemory.model_rebuild()
GitMergeSession.model_rebuild()
GitMergeConflict.model_rebuild()
AgentOrchestrationTask.model_rebuild()
AgentTaskResult.model_rebuild()
Workflow.model_rebuild()
WorkflowNode.model_rebuild()
WorkflowEdge.model_rebuild()
WorkflowExecution.model_rebuild()
WorkflowExecutionStep.model_rebuild()