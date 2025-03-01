import os
from dotenv import load_dotenv

import openai

load_dotenv()

class AzureOpenAIConfig:
    def __init__(self):
        self.api_key = os.getenv("AZURE_OPENAI_API_KEY")
        self.endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        self.api_version = os.getenv("AZURE_OPENAI_API_VERSION")
        self.deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

        if not all([self.api_key, self.endpoint, self.deployment_name]):
            raise ValueError("Missing required Azure OpenAI configuration values")