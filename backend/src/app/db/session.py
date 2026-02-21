from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

_engine: AsyncEngine | None = None
_sessionmaker: async_sessionmaker[AsyncSession] | None = None

async def get_engine() -> AsyncEngine | None:
    global _engine, _sessionmaker
    if _engine is not None:
        return _engine
    
    if not settings.database_url:
        return None

    _engine = create_async_engine(settings.database_url, pool_pre_ping=True)
    _sessionmaker = async_sessionmaker(_engine, expire_on_commit=False)
    return _engine

def get_sessionmaker() -> async_sessionmaker[AsyncSession] | None:
    get_engine()
    return _sessionmaker