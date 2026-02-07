from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.config import settings
from app.core.database import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.core.logging import setup_logging, logger
    setup_logging()
    logger.info("Sentinel-X SIEM Backend Starting...")
    create_db_and_tables()
    yield
    logger.info("Sentinel-X SIEM Backend Shutting Down...")

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

from app.api import endpoints, dashboard
app.include_router(endpoints.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard"])

@app.get("/")
def root():
    return {"message": "Sentinel-X SIEM Active"}

# We will import and include routers here later
