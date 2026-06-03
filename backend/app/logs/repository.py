import csv
import io
from datetime import datetime, timezone

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.logs.models import Log
from app.logs.schemas import LogCreate, LogQueryParams, LogUpdate


def apply_log_filters(stmt: Select, params: LogQueryParams) -> Select:
    if params.start:
        stmt = stmt.where(Log.timestamp >= params.start)
    if params.end:
        stmt = stmt.where(Log.timestamp <= params.end)
    if params.severity:
        stmt = stmt.where(Log.severity.in_(params.severity))
    if params.source:
        stmt = stmt.where(Log.source == params.source)
    if params.search:
        stmt = stmt.where(Log.message.ilike(f"%{params.search}%"))
    return stmt


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
    base_stmt = apply_log_filters(select(Log), params)

    count_stmt = select(func.count()).select_from(base_stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    sort_col = getattr(Log, params.sort_by)
    sort_col = sort_col.desc() if params.order == "desc" else sort_col.asc()

    offset = (params.page - 1) * params.page_size
    data_stmt = base_stmt.order_by(sort_col).offset(offset).limit(params.page_size)

    result = await db.execute(data_stmt)
    return result.scalars().all(), total


async def export_logs_csv(db: AsyncSession, params: LogQueryParams) -> str:
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
