from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    app_name: str = "API Fusion"
    environment: str = "local"

    http_timeout_seconds: float = 3.0
    github_token: str | None = None

    # CSV в .env: RSS_FEEDS="https://hnrss.org/newest,https://www.reddit.com/r/Python/.rss"
    rss_feeds: list[str] = Field(default_factory=lambda: ["https://hnrss.org/newest"])

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()