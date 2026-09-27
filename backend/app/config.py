from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "synthetic-web-testing-platform"
    postgres_db: str = "synthetic_platform"
    postgres_user: str = "platform"
    postgres_password: str = "platform"
    postgres_host: str = "postgres"
    postgres_port: int = 5432
    redis_url: str = "redis://redis:6379/0"
    jwt_secret: str = "change-me-in-production"

    class Config:
        env_file = ".env"


settings = Settings()
