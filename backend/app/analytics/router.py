from typing import Annotated

from fastapi import APIRouter, Query

from app.analytics import service
from app.analytics.schemas import (
    AnalyticsQueryParams,
    AnalyticsSummary,
    HistogramResponse,
    TimeseriesResponse,
)
from app.core.dependencies import DbDep

router = APIRouter(prefix="/analytics", tags=["analytics"])

QueryDep = Annotated[AnalyticsQueryParams, Query()]


@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary(db: DbDep, params: QueryDep) -> AnalyticsSummary:
    return await service.get_summary(db, params)


@router.get("/timeseries", response_model=TimeseriesResponse)
async def get_timeseries(db: DbDep, params: QueryDep) -> TimeseriesResponse:
    return await service.get_timeseries(db, params)


@router.get("/histogram", response_model=HistogramResponse)
async def get_histogram(db: DbDep, params: QueryDep) -> HistogramResponse:
    return await service.get_histogram(db, params)
