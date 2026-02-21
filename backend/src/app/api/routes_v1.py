from datetime import datetime, timezone

from fastapi import APIRouter, Query

from app.models.search import SearchResponse, SearchItem, ErrorInfo, SourceName
from app.models.sources import SourceStatus

router = APIRouter(prefix="/v1", tags=["v1"])

AVAILABLE_SOURCES: list[SourceName] = ["github", "hackernews", "rss"]


@router.get("/sources", response_model=list[SourceStatus])
async def get_sources():
    now = datetime.now(timezone.utc)
    return [
        SourceStatus(source="github", ok=True, last_checked_at=now, latency_ms=120),
        SourceStatus(source="hackernews", ok=True, last_checked_at=now, latency_ms=80),
        SourceStatus(source="rss", ok=True, last_checked_at=now, latency_ms=40),
    ]

@router.get("/search", response_model=SearchResponse)
async def search(
    q: str = Query(min_length=1, max_length=200),
    sources: list[SourceName] = Query(default=["github", "hackernews"]),
    limit: int = Query(default=20, ge=1, le=50),
):
    now = datetime.now(timezone.utc)

    items: list[SearchItem] = [
        SearchItem(
            source="github",
            title=f"Example repo about {q}",
            url="https://github.com/example/repo",
            snippet="Mock result. Next step: real GitHub search connector.",
            score=1234,
            timestamp=now,
        ),
         SearchItem(
            source="hackernews",
            title=f"HN discussion: {q}",
            url="https://news.ycombinator.com/item?id=1",
            snippet="Mock result. Next step: real HackerNews search connector.",
            score=256,
            timestamp=now,
        ),
    ]
    # simulate partial failure if rss selected (to demonstrate errors[] contract)
    errors: list[ErrorInfo] = []
    if "rss" in sources:
        errors.append(ErrorInfo(source="rss", message="RSS source temporarily unavailable", type="source_error"))

    # apply limit
    items = [it for it in items if it.source in sources]
    items = items[:limit]

    return SearchResponse(query=q, sources=sources, items=items, errors=errors)
