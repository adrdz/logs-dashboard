from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.database import get_db
from app.models import Severity
from app.schemas import LogCreate, LogQueryParams, LogRead, LogUpdate, PaginatedLogs

router = APIRouter(prefix="/api/logs", tags=["logs"])

DbDep = Annotated[AsyncSession, Depends(get_db)]


def _parse_query_params(
    start=Query(None),
    end=Query(None),
    severity: list[Severity] | None = Query(None),
    source: str | None = Query(None),
    search: str | None = Query(None),
    sort_by: str = Query("timestamp"),
    order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
) -> LogQueryParams:
    return LogQueryParams(
        start=start,
        end=end,
        severity=severity,
        source=source,
        search=search,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=LogRead, status_code=status.HTTP_201_CREATED)
async def create_log(body: LogCreate, db: DbDep) -> LogRead:
    log = await crud.create_log(db, body)
    return LogRead.model_validate(log)


@router.get("/export")
async def export_csv(
    db: DbDep,
    params: LogQueryParams = Depends(_parse_query_params),
) -> StreamingResponse:
    csv_content = await crud.export_logs_csv(db, params)

    def generate():
        yield csv_content

    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=logs_export.csv"},
    )


@router.get("", response_model=PaginatedLogs)
async def list_logs(
    db: DbDep,
    params: LogQueryParams = Depends(_parse_query_params),
) -> PaginatedLogs:
    import math
    logs, total = await crud.list_logs(db, params)
    pages = math.ceil(total / params.page_size) if total else 1
    return PaginatedLogs(
        items=[LogRead.model_validate(log) for log in logs],
        total=total,
        page=params.page,
        page_size=params.page_size,
        pages=pages,
    )


@router.get("/{log_id}", response_model=LogRead)
async def get_log(log_id: int, db: DbDep) -> LogRead:
    log = await crud.get_log(db, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return LogRead.model_validate(log)


@router.patch("/{log_id}", response_model=LogRead)
async def update_log(log_id: int, body: LogUpdate, db: DbDep) -> LogRead:
    log = await crud.get_log(db, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    updated = await crud.update_log(db, log, body)
    return LogRead.model_validate(updated)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_log(log_id: int, db: DbDep) -> None:
    log = await crud.get_log(db, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    await crud.delete_log(db, log)
