from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "API Fusion"
    environment: str = "local"

    # later: per-source timeouts, api keys, redis, db, etc.
    model_config = SettingsConfigDict(env_file=".env", extra='ignore')

settings = Settings()