from datetime import datetime
from pydantic import BaseModel


class LogRow(BaseModel):
    id: int
    ts: datetime
    request_id: str
    q: str
    sources: list[str]
    took_ms: int
    items_count: int
    errors_count: int