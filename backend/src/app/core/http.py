import httpx

from app.core.config import settings

def make_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        timeout=httpx.Timeout(settings.http_timeout_seconds),
        headers={
            "User-Agent": "api-fusion/0.1",
        },
    )