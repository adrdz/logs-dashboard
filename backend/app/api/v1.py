from fastapi import APIRouter

from app.analytics.router import router as analytics_router
from app.logs.router import router as logs_router

api_router = APIRouter(prefix="/api")
api_router.include_router(logs_router)
api_router.include_router(analytics_router)
