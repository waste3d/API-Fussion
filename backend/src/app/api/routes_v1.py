from fastapi import APIRouter, Query
from starlette.requests import Request


from app.models.search import SearchResponse, SourceName
from app.services.aggregator import aggregate_search

from sqlalchemy import select, desc
from app.db.models import RequestLog
from app.db.session import get_sessionmaker
from app.models.logs import LogRow

router = APIRouter(prefix="/v1", tags=["v1"])

AVAILABLE_SOURCES: list[SourceName] = ["github", "hackernews", "rss"]


@router.get("/search", response_model=SearchResponse)
async def search(
    request: Request,
    q: str = Query(min_length=1, max_length=200),
    sources: list[SourceName] = Query(default=["github", "hackernews"]),
    limit: int = Query(default=20, ge=1, le=50),
):
    items, errors = await aggregate_search(q=q, sources=sources, limit=limit)
    resp = SearchResponse(query=q, sources=sources, items=items, errors=errors)
    resp.took_ms = getattr(request.state, "took_ms", None)
    
    return resp

@router.get("/logs", response_model=list[LogRow])
async def logs(limit: int = Query(default=50, ge=1, le=200)):
    sessionmaker = get_sessionmaker()
    if sessionmaker is None:
        return []

    async with sessionmaker() as session:
        stmt = select(RequestLog).order_by(desc(RequestLog.id)).limit(limit)
        res = await session.execute(stmt)
        rows = res.scalars().all()

    return [
        LogRow(
            id=r.id,
            ts=r.ts,
            request_id=r.request_id,
            q=r.q,
            sources=r.sources,
            took_ms=r.took_ms,
            items_count=r.items_count,
            errors_count=r.errors_count,
        )
        for r in rows
    ]