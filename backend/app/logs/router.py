from typing import Annotated

from fastapi import APIRouter, Query, status
from fastapi.responses import StreamingResponse

from app.core.dependencies import DbDep
from app.logs import service
from app.logs.schemas import LogCreate, LogQueryParams, LogRead, LogUpdate, PaginatedLogs

router = APIRouter(prefix="/logs", tags=["logs"])

QueryDep = Annotated[LogQueryParams, Query()]


@router.post("", response_model=LogRead, status_code=status.HTTP_201_CREATED)
async def create_log(body: LogCreate, db: DbDep) -> LogRead:
    return await service.create_log(db, body)


@router.get("/export")
async def export_csv(db: DbDep, params: QueryDep) -> StreamingResponse:
    csv_content = await service.export_csv(db, params)

    def generate():
        yield csv_content

    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=logs_export.csv"},
    )


@router.get("", response_model=PaginatedLogs)
async def list_logs(db: DbDep, params: QueryDep) -> PaginatedLogs:
    return await service.list_logs(db, params)


@router.get("/{log_id}", response_model=LogRead)
async def get_log(log_id: int, db: DbDep) -> LogRead:
    return await service.get_log(db, log_id)


@router.patch("/{log_id}", response_model=LogRead)
async def update_log(log_id: int, body: LogUpdate, db: DbDep) -> LogRead:
    return await service.update_log(db, log_id, body)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_log(log_id: int, db: DbDep) -> None:
    await service.delete_log(db, log_id)
