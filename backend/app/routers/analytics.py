from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.database import get_db
from app.models import Severity
from app.schemas import (
    AnalyticsQueryParams,
    AnalyticsSummary,
    HistogramResponse,
    TimeseriesResponse,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

DbDep = Annotated[AsyncSession, Depends(get_db)]


def _parse_analytics_params(
    start=Query(None),
    end=Query(None),
    severity: list[Severity] | None = Query(None),
    source: str | None = Query(None),
    interval: str = Query("day"),
    group_by: str = Query("severity"),
) -> AnalyticsQueryParams:
    return AnalyticsQueryParams(
        start=start,
        end=end,
        severity=severity,
        source=source,
        interval=interval,
        group_by=group_by,
    )


@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary(
    db: DbDep,
    params: AnalyticsQueryParams = Depends(_parse_analytics_params),
) -> AnalyticsSummary:
    return await crud.get_summary(db, params)


@router.get("/timeseries", response_model=TimeseriesResponse)
async def get_timeseries(
    db: DbDep,
    params: AnalyticsQueryParams = Depends(_parse_analytics_params),
) -> TimeseriesResponse:
    return await crud.get_timeseries(db, params)


@router.get("/histogram", response_model=HistogramResponse)
async def get_histogram(
    db: DbDep,
    params: AnalyticsQueryParams = Depends(_parse_analytics_params),
) -> HistogramResponse:
    return await crud.get_histogram(db, params)
