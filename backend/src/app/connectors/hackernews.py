from datetime import datetime, timezone
from typing import Any

import httpx

from app.models.search import SearchItem


ALGOLIA_URL = "https://hn.algolia.com/api/v1/search"


async def search_hn(client: httpx.AsyncClient, q: str, limit: int) -> list[SearchItem]:
    params = {"query": q, "tags": "story", "hitsPerPage": min(limit, 50)}
    r = await client.get(ALGOLIA_URL, params=params)
    r.raise_for_status()
    data: dict[str, Any] = r.json()

    items: list[SearchItem] = []
    for hit in data.get("hits", []):
        title = hit.get("title") or hit.get("story_title")
        url = hit.get("url") or hit.get("story_url")
        if not title or not url:
            continue

        created_at = hit.get("created_at")
        ts = None
        if created_at:
            try:
                ts = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            except Exception:
                ts = None

        items.append(
            SearchItem(
                source="hackernews",
                title=title,
                url=url,
                snippet=hit.get("story_text") or None,
                score=int(hit.get("points") or 0) if hit.get("points") is not None else None,
                timestamp=ts or datetime.now(timezone.utc),
            )
        )

    return items[:limit]