from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_system import router as system_router
from app.api.routes_v1 import router as v1_router
from app.core.config import settings
from app.core.middleware import RequestMetaMiddleware

app = FastAPI(title=settings.app_name)


app.add_middleware(RequestMetaMiddleware)
# dev cors settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(system_router)
app.include_router(v1_router)