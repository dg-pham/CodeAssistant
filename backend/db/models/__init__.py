from backend.db.models.user import User
from backend.db.models.conversation import Conversation
from backend.db.models.message import Message
from backend.db.models.code_snippet import CodeSnippet
from backend.db.models.feedback import Feedback
from backend.db.models.memory import AgentMemory

User.model_rebuild()
Conversation.model_rebuild()
Message.model_rebuild()
CodeSnippet.model_rebuild()
Feedback.model_rebuild()
AgentMemory.model_rebuild()