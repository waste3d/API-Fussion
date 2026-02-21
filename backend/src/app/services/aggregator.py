import asyncio
from typing import Callable, Awaitable

import httpx

from app.core.http import make_client
from app.models.search import SearchItem, ErrorInfo, SourceName
from app.connectors.github import search_github
from app.connectors.hackernews import search_hn
from app.connectors.rss import search_rss


ConnectorFn = Callable[[httpx.AsyncClient, str, int], Awaitable[list[SearchItem]]]

CONNECTORS: dict[SourceName, ConnectorFn] = {
    "github": search_github,
    "hackernews": search_hn,
    "rss": search_rss,
}


async def aggregate_search(q: str, sources: list[SourceName], limit: int) -> tuple[list[SearchItem], list[ErrorInfo]]:
    async with make_client() as client:
        tasks = []
        for s in sources:
            fn = CONNECTORS.get(s)
            if not fn:
                continue
            tasks.append((s, asyncio.create_task(fn(client, q, limit))))

        items: list[SearchItem] = []
        errors: list[ErrorInfo] = []

        for source, task in tasks:
            try:
                res = await task
                items.extend(res)
            except httpx.TimeoutException:
                errors.append(ErrorInfo(source=source, message="Timeout while calling source", type="timeout"))
            except httpx.HTTPStatusError as e:
                errors.append(ErrorInfo(source=source, message=f"Bad status from source: {e.response.status_code}", type="bad_status"))
            except Exception as e:
                errors.append(ErrorInfo(source=source, message=f"Unhandled error: {e}", type="unknown"))

        # можно сделать сортировку “по score desc, потом по timestamp desc”
        items.sort(key=lambda x: ((x.score or 0), (x.timestamp or 0)), reverse=True)
        return items[:limit], errors