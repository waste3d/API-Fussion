from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import settings
from app.models.search import SearchItem


GITHUB_SEARCH_URL = "https://api.github.com/search/repositories"


async def search_github(client: httpx.AsyncClient, q: str, limit: int) -> list[SearchItem]:
    headers = {}
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"

    params = {
        "q": q,
        "sort": "stars",
        "order": "desc",
        "per_page": min(limit, 50),
    }

    r = await client.get(GITHUB_SEARCH_URL, params=params, headers=headers)
    r.raise_for_status()
    data: dict[str, Any] = r.json()

    items: list[SearchItem] = []
    for repo in data.get("items", []):
        url = repo.get("html_url")
        name = repo.get("full_name")
        if not url or not name:
            continue

        pushed_at = repo.get("pushed_at")
        ts = None
        if pushed_at:
            try:
                ts = datetime.fromisoformat(pushed_at.replace("Z", "+00:00"))
            except Exception:
                ts = None

        items.append(
            SearchItem(
                source="github",
                title=name,
                url=url,
                snippet=repo.get("description") or None,
                score=int(repo.get("stargazers_count") or 0) if repo.get("stargazers_count") is not None else None,
                timestamp=ts or datetime.now(timezone.utc),
            )
        )

    return items[:limit]