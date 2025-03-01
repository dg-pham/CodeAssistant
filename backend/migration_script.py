import json
import sqlite3
from sqlmodel import Session
from datetime import datetime

from backend.db.base import engine, init_database
from backend.db.models.user import User
from backend.db.models.conversation import Conversation
from backend.db.models.message import Message
from backend.db.models.code_snippet import CodeSnippet
from backend.db.models.feedback import Feedback
from backend.db.models.memory import AgentMemory


def migrate_data(old_db_path="code_agent.db"):
    # Kết nối đến database cũ
    old_conn = sqlite3.connect(old_db_path)
    old_conn.row_factory = sqlite3.Row

    # Tạo schema cho database mới
    init_database()

    # Tạo session cho database mới
    with Session(engine) as session:
        # Migrate users
        cursor = old_conn.execute("SELECT * FROM users")
        for row in cursor.fetchall():
            user = User(
                id=row["id"],
                name=row["name"],
                created_at=datetime.fromisoformat(row["created_at"])
            )
            session.add(user)

        # Migrate conversations
        cursor = old_conn.execute("SELECT * FROM conversations")
        for row in cursor.fetchall():
            conversation = Conversation(
                id=row["id"],
                user_id=row["user_id"],
                title=row["title"],
                created_at=datetime.fromisoformat(row["created_at"]),
                updated_at=datetime.fromisoformat(row["updated_at"])
            )
            session.add(conversation)

        # Migrate messages
        cursor = old_conn.execute("SELECT * FROM messages")
        for row in cursor.fetchall():
            message = Message(
                id=row["id"],
                conversation_id=row["conversation_id"],
                role=row["role"],
                content=row["content"],
                timestamp=datetime.fromisoformat(row["timestamp"])
            )
            session.add(message)

        # Migrate code_snippets
        cursor = old_conn.execute("SELECT * FROM code_snippets")
        for row in cursor.fetchall():
            code_snippet = CodeSnippet(
                id=row["id"],
                user_id=row["user_id"],
                language=row["language"],
                code=row["code"],
                description=row["description"],
                tags=json.loads(row["tags"]),
                created_at=datetime.fromisoformat(row["created_at"]),
                updated_at=datetime.fromisoformat(row["updated_at"])
            )
            session.add(code_snippet)

        # Migrate feedback
        cursor = old_conn.execute("SELECT * FROM feedback")
        for row in cursor.fetchall():
            feedback = Feedback(
                id=row["id"],
                message_id=row["message_id"],
                rating=row["rating"],
                comment=row["comment"],
                created_at=datetime.fromisoformat(row["created_at"])
            )
            session.add(feedback)

        # Migrate agent_memory
        cursor = old_conn.execute("SELECT * FROM agent_memory")
        for row in cursor.fetchall():
            memory = AgentMemory(
                id=row["id"],
                user_id=row["user_id"],
                key=row["key"],
                value=row["value"],
                context=row["context"],
                priority=row["priority"],
                created_at=datetime.fromisoformat(row["created_at"]),
                updated_at=datetime.fromisoformat(row["updated_at"])
            )
            session.add(memory)

        # Commit all changes
        session.commit()

    # Close old connection
    old_conn.close()

    print("Migration completed successfully!")


if __name__ == "__main__":
    migrate_data()