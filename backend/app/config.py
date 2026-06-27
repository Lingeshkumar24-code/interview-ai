from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    GROQ_API_KEY: str = 'your_groq_api_key_here'
    DATABASE_URL: str = 'sqlite:///./interviewiq.db'
    MODEL_NAME: str = 'llama-3.3-70b-versatile'
    JWT_SECRET: str = 'interviewiq-super-secret-key-2024'
    JWT_ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    model_config = {'env_file': '.env', 'extra': 'ignore'}


settings = Settings()
