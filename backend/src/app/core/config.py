from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "API Fusion"
    environment: str = "local"

    http_timeout_seconds: float = 3.0
    github_token: str | None = None

    # CSV строка (простая и надёжная для env)
    rss_feeds_csv: str = "https://hnrss.org/newest"

    database_url: str | None = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def rss_feeds(self) -> list[str]:
        return [s.strip() for s in self.rss_feeds_csv.split(",") if s.strip()]


settings = Settings()