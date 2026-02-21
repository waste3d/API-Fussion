from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

_engine: AsyncEngine | None = None
_sessionmaker: async_sessionmaker[AsyncSession] | None = None

def get_engine() -> AsyncEngine | None:
    global _engine, _sessionmaker
    if _engine is not None:
        return _engine
    
    if not settings.database_url:
        return None

    _engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=5,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
      
    },
)
    _sessionmaker = async_sessionmaker(_engine, expire_on_commit=False)
    return _engine

def get_sessionmaker() -> async_sessionmaker[AsyncSession] | None:
    get_engine()
    return _sessionmaker