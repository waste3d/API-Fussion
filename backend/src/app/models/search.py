from datetime import datetime
from typing import Literal

from pydantic import BaseModel, HttpUrl, Field

SourceName = Literal["github", "hackernews", "rss"]

class ErrorInfo(BaseModel):
    source: SourceName
    message: str
    type: str = "source_error"

class SearchItem(BaseModel):
    source: SourceName
    title: str
    url: HttpUrl
    snippet: str | None = None
    score: int | None = None
    timestamp: datetime | None = None

class SearchResponse(BaseModel):
    query: str
    sources: list[SourceName]
    items: list[SearchItem]
    errors: list[ErrorInfo] = []
