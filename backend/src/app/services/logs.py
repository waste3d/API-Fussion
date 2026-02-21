from app.db.models import RequestLog
from app.db.session import get_sessionmaker


async def write_search_log(
    *,
    request_id: str,
    path: str,
    q: str,
    sources: list[str],
    limit: int,
    took_ms: int,
    items_count: int,
    errors: list[dict],
) -> None:
    sessionmaker = get_sessionmaker()
    if sessionmaker is None:
        return

    async with sessionmaker() as session:
        row = RequestLog(
            request_id=request_id,
            path=path,
            q=q,
            sources=sources,
            limit=limit,
            took_ms=took_ms,
            items_count=items_count,
            errors_count=len(errors),
            errors=errors,
        )
        session.add(row)
        await session.commit()