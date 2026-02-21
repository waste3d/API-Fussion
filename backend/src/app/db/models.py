from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class RequestLog(Base):
    __tablename__ = "request_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    request_id: Mapped[str] = mapped_column(String(64), index=True)
    path: Mapped[str] = mapped_column(String(200))
    q: Mapped[str] = mapped_column(String(300))
    sources: Mapped[list[str]] = mapped_column(JSON)
    limit: Mapped[int] = mapped_column(Integer)

    took_ms: Mapped[int] = mapped_column(Integer)
    items_count: Mapped[int] = mapped_column(Integer)
    errors_count: Mapped[int] = mapped_column(Integer)
    errors: Mapped[list[dict]] = mapped_column(JSON, default=list)