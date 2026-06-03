from sqlalchemy import String, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.schemas import (
    AnalyticsQueryParams,
    AnalyticsSummary,
    HistogramBar,
    HistogramResponse,
    SeverityCount,
    SourceCount,
    TimeseriesPoint,
    TimeseriesResponse,
)
from app.logs.models import Log, Severity
from app.logs.repository import apply_log_filters
from app.logs.schemas import LogQueryParams


def _to_log_query_params(params: AnalyticsQueryParams) -> LogQueryParams:
    return LogQueryParams(
        start=params.start,
        end=params.end,
        severity=params.severity,
        source=params.source,
    )


async def get_summary(db: AsyncSession, params: AnalyticsQueryParams) -> AnalyticsSummary:
    # Aggregate over the filtered rows. We group by the subquery's own columns
    # (not Log.*) — referencing Log.severity here would re-add the `logs` table
    # to the FROM clause and produce a cartesian product with the subquery.
    subq = apply_log_filters(select(Log), _to_log_query_params(params)).subquery()

    total_stmt = select(func.count()).select_from(subq)
    total = (await db.execute(total_stmt)).scalar_one()

    sev_stmt = (
        select(subq.c.severity, func.count().label("cnt"))
        .group_by(subq.c.severity)
    )
    sev_rows = (await db.execute(sev_stmt)).all()
    by_severity = [SeverityCount(severity=row.severity, count=row.cnt) for row in sev_rows]

    src_stmt = (
        select(subq.c.source, func.count().label("cnt"))
        .group_by(subq.c.source)
        .order_by(func.count().desc())
        .limit(20)
    )
    src_rows = (await db.execute(src_stmt)).all()
    by_source = [SourceCount(source=row.source, count=row.cnt) for row in src_rows]

    return AnalyticsSummary(total=total, by_severity=by_severity, by_source=by_source)


async def get_timeseries(
    db: AsyncSession, params: AnalyticsQueryParams
) -> TimeseriesResponse:
    subq = apply_log_filters(select(Log), _to_log_query_params(params)).subquery()

    trunc_expr = func.date_trunc(params.interval, subq.c.timestamp).label("bucket")

    if params.group_by == "severity":
        label_col = subq.c.severity.cast(String).label("label")
    else:
        label_col = subq.c.source.label("label")

    stmt = (
        select(trunc_expr, label_col, func.count().label("cnt"))
        .group_by(text("bucket"), label_col)
        .order_by(text("bucket"))
    )

    rows = (await db.execute(stmt)).all()
    data = [
        TimeseriesPoint(bucket=row.bucket, label=str(row.label), count=row.cnt)
        for row in rows
    ]
    return TimeseriesResponse(interval=params.interval, group_by=params.group_by, data=data)


async def get_histogram(db: AsyncSession, params: AnalyticsQueryParams) -> HistogramResponse:
    subq = apply_log_filters(select(Log), _to_log_query_params(params)).subquery()

    stmt = (
        select(subq.c.severity, func.count().label("cnt"))
        .group_by(subq.c.severity)
    )
    rows = (await db.execute(stmt)).all()

    counts = {row.severity: row.cnt for row in rows}
    data = [HistogramBar(severity=sev, count=counts.get(sev, 0)) for sev in Severity]
    return HistogramResponse(data=data)
