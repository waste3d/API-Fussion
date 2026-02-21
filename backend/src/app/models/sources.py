from datetime import datetime
from typing import Literal

from pydantic import BaseModel


SourceName = Literal["github", "hackernews", "rss"]


class SourceStatus(BaseModel):
    source: SourceName
    ok: bool
    last_checked_at: datetime
    latency_ms: int | None = None
    error: str | None = None