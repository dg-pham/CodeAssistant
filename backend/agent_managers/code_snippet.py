import json
import uuid
from typing import List, Dict, Optional

from backend.db import get_db_connection
from backend.models import CodeSnippet


class CodeSnippetManager:
    def __init__(self):
        pass

    def save_snippet(self, snippet: CodeSnippet) -> str:
        """Lưu đoạn mã"""
        with get_db_connection() as conn:
            cursor = conn.cursor()

            snippet_id = snippet.id or str(uuid.uuid4())
            tags_json = json.dumps(snippet.tags) if snippet.tags else "[]"

            cursor.execute(
                """
                INSERT INTO code_snippets (id, user_id, language, code, description, tags)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (snippet_id, snippet.user_id, snippet.language, snippet.code, snippet.description, tags_json)
            )

            conn.commit()
            return snippet_id

    def get_user_snippets(self, user_id: str, language: Optional[str] = None) -> List[Dict]:
        """Lấy đoạn mã của người dùng"""
        with get_db_connection() as conn:
            cursor = conn.cursor()

            if language:
                cursor.execute(
                    """
                    SELECT id, language, code, description, tags, created_at
                    FROM code_snippets
                    WHERE user_id = ? AND language = ?
                    ORDER BY created_at DESC
                    """,
                    (user_id, language)
                )
            else:
                cursor.execute(
                    """
                    SELECT id, language, code, description, tags, created_at
                    FROM code_snippets
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                    """,
                    (user_id,)
                )

            snippets = []
            for row in cursor.fetchall():
                snippet_dict = dict(row)
                snippet_dict['tags'] = json.loads(snippet_dict['tags'])
                snippets.append(snippet_dict)

            return snippets