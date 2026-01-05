from typing import List, Union

from dotenv import load_dotenv
from pydantic import AnyHttpUrl, ConfigDict, field_validator
from pydantic_settings import BaseSettings

# Explicitly load .env file
load_dotenv()

class Settings(BaseSettings):
    """
    Cấu hình hệ thống (Settings) dựa trên Pydantic v2.
    Using Supabase Connection Pooler by default.
    """
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Synapse Spa"

    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database Configuration
    # Note: We rename keys to avoid conflict with '.env' file which contains direct connection details (POSTGRES_SERVER)
    # that are currently failing due to DNS issues.
    # We prioritize Pooler configuration.

    DB_HOST: str = "aws-1-ap-south-1.pooler.supabase.com"
    DB_USER: str = "postgres.dspxxsdvuenhhhrqqfsp"
    DB_PORT: str = "5432"
    DB_NAME: str = "postgres"

    # Password IS loaded from .env (POSTGRES_PASSWORD)
    POSTGRES_PASSWORD: str = ""

    DATABASE_URL: str | None = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str | None, info) -> str:
        if isinstance(v, str):
            return v

        return f"postgresql+asyncpg://{info.data.get('DB_USER')}:{info.data.get('POSTGRES_PASSWORD')}@{info.data.get('DB_HOST')}:{info.data.get('DB_PORT')}/{info.data.get('DB_NAME')}"

    # JWT Security
    # SECURITY: SECRET_KEY MUST be set in .env file. No default value for production safety.
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = "" # Anon Key
    SUPABASE_SERVICE_ROLE_KEY: str = "" # Admin Key (Backend only)
    FRONTEND_URL: str = "http://localhost:3000"

    # Database SSL Configuration
    # Set to "true" in dev/local environments with self-signed certs (Supabase Pooler)
    # Set to "false" (or leave unset) in production with proper SSL certs
    DISABLE_SSL_VERIFY: bool = False

    model_config = ConfigDict(
        case_sensitive=True,
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
