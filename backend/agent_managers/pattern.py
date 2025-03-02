import openai
from fastapi import BackgroundTasks
from sqlmodel import Session

from backend.LLM_Bundle.Azure_LLM import AzureOpenAIConfig
from backend.db.models.memory import AgentMemory
from backend.db.services.memory import AgentMemoryService
from backend.log import logger

config = AzureOpenAIConfig()

client = openai.AzureOpenAI(
    api_key=config.api_key,
    api_version=config.api_version,
    azure_endpoint=config.endpoint
)

class PatternExtractor:
    def __init__(self):
        pass

    def extract_code_preferences(self, code: str, language: str, user_id: str, background_tasks: BackgroundTasks):
        """Trích xuất và học từ mã của người dùng"""
        # Thêm task trích xuất mẫu vào hàng đợi background
        background_tasks.add_task(
            self._analyze_code_pattern,
            code,
            language,
            user_id
        )

    async def _analyze_code_pattern(self, code: str, language: str, user_id: str):
        """Phân tích mẫu mã để học hỏi"""
        try:
            response = client.chat.completions.create(
                model=config.deployment_name,
                messages=[
                    {"role": "system",
                     "content": f"Analyze this {language} code and extract coding style preferences like indentation, naming conventions, comment style, and code organization patterns."},
                    {"role": "user", "content": code}
                ],
                temperature=0.3,
                max_tokens=500
            )

            analysis = response.choices[0].message.content

            # Tạo session mới để lưu trữ memory
            from backend.db.base import engine
            from sqlmodel import Session

            with Session(engine) as session:
                memory_service = AgentMemoryService(session)

                # Lưu trữ các mẫu được phát hiện
                pattern_lines = [p.strip() for p in analysis.split("\n") if p.strip()]
                for i, pattern in enumerate(pattern_lines):
                    if ":" in pattern:
                        key, value = pattern.split(":", 1)
                        key = key.strip()
                        value = value.strip()

                        # Lưu trữ mẫu với ngữ cảnh ngôn ngữ cụ thể
                        memory = AgentMemory(
                            user_id=user_id,
                            key=f"code_style_{language}_{key}",
                            value=value,
                            context=f"code_style_{language}",
                            priority=0.7  # Ưu tiên cao vì đây là mẫu trực tiếp từ mã của người dùng
                        )
                        memory_service.store_memory(memory)

        except Exception as e:
            logger.error(f"Error analyzing code pattern: {str(e)}")