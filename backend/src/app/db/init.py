import logging

from app.db.models import Base
from app.db.session import get_engine

log = logging.getLogger("api-fusion")


async def init_db() -> None:
    engine = get_engine()
    if engine is None:
        log.warning("DB disabled: DATABASE_URL not set")
        return

    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        log.info("DB ready")
    except Exception as e:
        # Критично: НЕ валим приложение
        log.warning(f"DB init failed, continuing without DB: {e!r}")