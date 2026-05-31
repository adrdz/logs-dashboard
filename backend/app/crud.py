import csv
import io
from datetime import datetime, timezone

from sqlalchemy import Select, String, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Log, Severity
from app.schemas import (
    AnalyticsQueryParams,
    AnalyticsSummary,
    HistogramBar,
    HistogramResponse,
    LogCreate,
    LogQueryParams,
    LogUpdate,
    SeverityCount,
    SourceCount,
    TimeseriesPoint,
    TimeseriesResponse,
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _apply_filters(stmt: Select, params: LogQueryParams | AnalyticsQueryParams) -> Select:
    if params.start:
        stmt = stmt.where(Log.timestamp >= params.start)
    if params.end:
        stmt = stmt.where(Log.timestamp <= params.end)
    if params.severity:
        stmt = stmt.where(Log.severity.in_(params.severity))
    if params.source:
        stmt = stmt.where(Log.source == params.source)
    if isinstance(params, LogQueryParams) and params.search:
        stmt = stmt.where(Log.message.ilike(f"%{params.search}%"))
    return stmt


# ─── CRUD ─────────────────────────────────────────────────────────────────────

async def create_log(db: AsyncSession, data: LogCreate) -> Log:
    log = Log(
        message=data.message,
        severity=data.severity,
        source=data.source,
        timestamp=data.timestamp or datetime.now(timezone.utc),
    )
    db.add(log)
    await db.flush()
    await db.refresh(log)
    return log


async def get_log(db: AsyncSession, log_id: int) -> Log | None:
    result = await db.execute(select(Log).where(Log.id == log_id))
    return result.scalar_one_or_none()


async def update_log(db: AsyncSession, log: Log, data: LogUpdate) -> Log:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(log, field, value)
    await db.flush()
    await db.refresh(log)
    return log


async def delete_log(db: AsyncSession, log: Log) -> None:
    await db.delete(log)
    await db.flush()


async def list_logs(db: AsyncSession, params: LogQueryParams) -> tuple[list[Log], int]:
    base_stmt = select(Log)
    base_stmt = _apply_filters(base_stmt, params)

    # Count total
    count_stmt = select(func.count()).select_from(base_stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    # Sort
    sort_col = getattr(Log, params.sort_by)
    if params.order == "desc":
        sort_col = sort_col.desc()
    else:
        sort_col = sort_col.asc()

    # Paginate
    offset = (params.page - 1) * params.page_size
    data_stmt = base_stmt.order_by(sort_col).offset(offset).limit(params.page_size)

    result = await db.execute(data_stmt)
    return result.scalars().all(), total


# ─── Analytics ────────────────────────────────────────────────────────────────

async def get_summary(db: AsyncSession, params: AnalyticsQueryParams) -> AnalyticsSummary:
    base = select(Log)
    base = _apply_filters(base, params)

    # Total
    total_stmt = select(func.count()).select_from(base.subquery())
    total = (await db.execute(total_stmt)).scalar_one()

    # By severity
    sev_stmt = (
        select(Log.severity, func.count().label("cnt"))
        .select_from(base.subquery())
        .group_by(Log.severity)
    )
    sev_rows = (await db.execute(sev_stmt)).all()
    by_severity = [SeverityCount(severity=row.severity, count=row.cnt) for row in sev_rows]

    # By source
    src_stmt = (
        select(Log.source, func.count().label("cnt"))
        .select_from(base.subquery())
        .group_by(Log.source)
        .order_by(func.count().desc())
        .limit(20)
    )
    src_rows = (await db.execute(src_stmt)).all()
    by_source = [SourceCount(source=row.source, count=row.cnt) for row in src_rows]

    return AnalyticsSummary(total=total, by_severity=by_severity, by_source=by_source)


async def get_timeseries(
    db: AsyncSession, params: AnalyticsQueryParams
) -> TimeseriesResponse:
    trunc_expr = func.date_trunc(params.interval, Log.timestamp).label("bucket")

    if params.group_by == "severity":
        label_col = Log.severity.cast(String).label("label")
    else:
        label_col = Log.source.label("label")

    base = select(Log)
    base = _apply_filters(base, params)

    stmt = (
        select(trunc_expr, label_col, func.count().label("cnt"))
        .select_from(base.subquery())
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
    base = select(Log)
    base = _apply_filters(base, params)

    stmt = (
        select(Log.severity, func.count().label("cnt"))
        .select_from(base.subquery())
        .group_by(Log.severity)
    )
    rows = (await db.execute(stmt)).all()

    # Return all severities (zero-fill missing)
    counts = {row.severity: row.cnt for row in rows}
    data = [
        HistogramBar(severity=sev, count=counts.get(sev, 0))
        for sev in Severity
    ]
    return HistogramResponse(data=data)


async def export_logs_csv(db: AsyncSession, params: LogQueryParams) -> str:
    # Override pagination for full export (capped at 100k rows)
    export_params = params.model_copy(update={"page": 1, "page_size": 100_000})
    logs, _ = await list_logs(db, export_params)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "timestamp", "severity", "source", "message", "created_at"])
    for log in logs:
        writer.writerow([
            log.id,
            log.timestamp.isoformat(),
            log.severity.value,
            log.source,
            log.message,
            log.created_at.isoformat(),
        ])
    return output.getvalue()
