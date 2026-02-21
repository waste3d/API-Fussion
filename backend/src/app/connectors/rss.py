from datetime import datetime, timezone

import feedparser
import httpx

from app.core.config import settings
from app.models.search import SearchItem


def _contains_q(text: str | None, q: str) -> bool:
    if not text:
        return False
    return q.lower() in text.lower()


async def search_rss(client: httpx.AsyncClient, q: str, limit: int) -> list[SearchItem]:
    items: list[SearchItem] = []

    for feed_url in settings.rss_feeds:
        r = await client.get(feed_url)
        r.raise_for_status()

        feed = feedparser.parse(r.text)
        for entry in feed.entries:
            title = getattr(entry, "title", None)
            link = getattr(entry, "link", None)
            summary = getattr(entry, "summary", None)

            if not link or not title:
                continue

            # простой фильтр по q
            if not (_contains_q(title, q) or _contains_q(summary, q)):
                continue

            # timestamp (если есть)
            ts = datetime.now(timezone.utc)
            if getattr(entry, "published_parsed", None):
                try:
                    ts = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                except Exception:
                    pass

            items.append(
                SearchItem(
                    source="rss",
                    title=title,
                    url=link,
                    snippet=summary or None,
                    score=None,
                    timestamp=ts,
                )
            )

            if len(items) >= limit:
                return items[:limit]

    return items[:limit]