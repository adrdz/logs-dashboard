import math

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.logs import repository
from app.logs.models import Log
from app.logs.schemas import LogCreate, LogQueryParams, LogRead, LogUpdate, PaginatedLogs


async def get_log_or_404(db: AsyncSession, log_id: int) -> Log:
    log = await repository.get_log(db, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log


async def create_log(db: AsyncSession, data: LogCreate) -> LogRead:
    log = await repository.create_log(db, data)
    return LogRead.model_validate(log)


async def list_logs(db: AsyncSession, params: LogQueryParams) -> PaginatedLogs:
    logs, total = await repository.list_logs(db, params)
    pages = math.ceil(total / params.page_size) if total else 1
    return PaginatedLogs(
        items=[LogRead.model_validate(log) for log in logs],
        total=total,
        page=params.page,
        page_size=params.page_size,
        pages=pages,
    )


async def get_log(db: AsyncSession, log_id: int) -> LogRead:
    log = await get_log_or_404(db, log_id)
    return LogRead.model_validate(log)


async def update_log(db: AsyncSession, log_id: int, data: LogUpdate) -> LogRead:
    log = await get_log_or_404(db, log_id)
    updated = await repository.update_log(db, log, data)
    return LogRead.model_validate(updated)


async def delete_log(db: AsyncSession, log_id: int) -> None:
    log = await get_log_or_404(db, log_id)
    await repository.delete_log(db, log)


async def export_csv(db: AsyncSession, params: LogQueryParams) -> str:
    return await repository.export_logs_csv(db, params)
