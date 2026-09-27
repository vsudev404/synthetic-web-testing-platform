from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")
    app_name: str = "synthetic-web-testing-platform"
    redis_url: str = "redis://redis:6379/0"
    max_visitors_per_job: int = 100
    allowed_target_domains: list[str] = []
    allow_private_targets: bool = False
    cors_origins: list[str] = ["http://localhost:3000"]
    log_level: str = "INFO"


settings = Settings()
