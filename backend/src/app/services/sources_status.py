import asyncio
import time
from datetime import datetime, timezone
from typing import Any

from app.services.source_probe import probe_github, probe_hackernews, probe_rss

# TTL кэша (сек). Можно вынести в settings/env позже.
CACHE_TTL_S = 15.0

_lock = asyncio.Lock()
_cache: dict[str, Any] = {
    "ts": 0.0,
    "data": None,
}


async def get_sources_status(force: bool = False) -> list[dict]:
    """
    Возвращает статус источников.
    - по умолчанию: отдаёт кэш, если он "свежий"
    - force=True: принудительно обновляет (но всё равно под lock)
    """
    now = time.monotonic()

    # быстрый путь без локов
    if not force and _cache["data"] is not None and (now - _cache["ts"] < CACHE_TTL_S):
        return _cache["data"]

    async with _lock:
        # двойная проверка внутри lock (чтобы параллельные запросы не обновляли кэш пачкой)
        now2 = time.monotonic()
        if not force and _cache["data"] is not None and (now2 - _cache["ts"] < CACHE_TTL_S):
            return _cache["data"]

        checked_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

        gh_task = probe_github()
        hn_task = probe_hackernews()
        rss_task = probe_rss()

        gh, hn, rss = await asyncio.gather(gh_task, hn_task, rss_task)

        data = [
            {
                "source": "github",
                "ok": gh.ok,
                "last_checked_at": checked_at,
                "latency_ms": gh.latency_ms,
                "error": gh.error,
            },
            {
                "source": "hackernews",
                "ok": hn.ok,
                "last_checked_at": checked_at,
                "latency_ms": hn.latency_ms,
                "error": hn.error,
            },
            {
                "source": "rss",
                "ok": rss.ok,
                "last_checked_at": checked_at,
                "latency_ms": rss.latency_ms,
                "error": rss.error,
            },
        ]

        _cache["ts"] = time.monotonic()
        _cache["data"] = data
        return data