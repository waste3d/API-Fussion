import time
import uuid
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class RequestMetaMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # request_id доступен сразу
        request_id = request.headers.get("x-request-id") or uuid.uuid4().hex
        request.state.request_id = request_id

        start = time.perf_counter()
        try:
            response = await call_next(request)
        finally:
            request.state.took_ms = int((time.perf_counter() - start) * 1000)

        # полезные заголовки для curl/debug
        response.headers["X-Request-Id"] = request_id
        response.headers["X-Took-Ms"] = str(request.state.took_ms)

        # логируем search ПОСЛЕ выполнения (took_ms уже есть)
        if request.url.path == "/v1/search" and response.status_code == 200:
            try:
                # локальный импорт = меньше риска циклических импортов
                from app.services.logs import write_search_log

                q = request.query_params.get("q")
                sources = request.query_params.getlist("sources")

                limit_raw = request.query_params.get("limit")
                try:
                    limit = int(limit_raw) if limit_raw is not None else None
                except ValueError:
                    limit = None

                # ВАЖНО: передаём ТОЛЬКО те аргументы,
                # которые точно ожидает твоя текущая write_search_log().
                await write_search_log(
                    request_id=request_id,
                    path=request.url.path,
                    q=q,
                    sources=sources,
                    limit=limit,
                    took_ms=request.state.took_ms,
                    items_count=0,
                    errors=[],
                )
            except Exception:
                # никогда не роняем /v1/search из-за логирования
                pass

        return response