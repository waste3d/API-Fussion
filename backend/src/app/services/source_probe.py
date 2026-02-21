import time
from dataclasses import dataclass
from typing import Optional

import httpx


@dataclass
class ProbeResult:
    ok: bool
    latency_ms: int
    error: Optional[str] = None


async def probe_http_get(url: str, timeout_s: float = 3.0) -> ProbeResult:
    start = time.perf_counter()
    try:
        async with httpx.AsyncClient(
            timeout=timeout_s,
            follow_redirects=True,
            headers={"User-Agent": "API-Fusion/1.0"},
        ) as client:
            r = await client.get(url)

        latency_ms = int((time.perf_counter() - start) * 1000)
        if 200 <= r.status_code < 400:
            return ProbeResult(ok=True, latency_ms=latency_ms)
        return ProbeResult(ok=False, latency_ms=latency_ms, error=f"http_status:{r.status_code}")
    except Exception as e:
        latency_ms = int((time.perf_counter() - start) * 1000)
        return ProbeResult(ok=False, latency_ms=latency_ms, error=repr(e))


async def probe_github(timeout_s: float = 3.0) -> ProbeResult:
    # лёгкий публичный эндпоинт, без токена
    return await probe_http_get("https://api.github.com/rate_limit", timeout_s=timeout_s)


async def probe_hackernews(timeout_s: float = 3.0) -> ProbeResult:
    # публичный firebase endpoint HN
    return await probe_http_get("https://hacker-news.firebaseio.com/v0/topstories.json", timeout_s=timeout_s)


async def probe_rss(timeout_s: float = 3.0) -> ProbeResult:
    # берём первый RSS из env (если есть), иначе дефолт
    return await probe_http_get("https://hnrss.org/newest", timeout_s=timeout_s)