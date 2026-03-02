"""Application configuration from environment."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Settings loaded from env or .env file."""

    app_name: str = "Employee Leave Management API"
    debug: bool = False
    data_file: str | None = None
    secret_key: str = "leave-mgmt-dev-secret-set-SECRET_KEY-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
