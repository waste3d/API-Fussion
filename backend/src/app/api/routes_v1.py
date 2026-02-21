from fastapi import APIRouter, Query

from app.models.search import SearchResponse, SourceName
from app.services.aggregator import aggregate_search

router = APIRouter(prefix="/v1", tags=["v1"])

AVAILABLE_SOURCES: list[SourceName] = ["github", "hackernews", "rss"]


@router.get("/search", response_model=SearchResponse)
async def search(
    q: str = Query(min_length=1, max_length=200),
    sources: list[SourceName] = Query(default=["github", "hackernews"]),
    limit: int = Query(default=20, ge=1, le=50),
):
    items, errors = await aggregate_search(q=q, sources=sources, limit=limit)
    return SearchResponse(query=q, sources=sources, items=items, errors=errors)