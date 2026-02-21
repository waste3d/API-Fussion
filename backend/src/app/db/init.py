from app.db.models import Base
from app.db.session import get_engine


async def init_db() -> None:
    engine = get_engine()
    if engine is None:
        return

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)