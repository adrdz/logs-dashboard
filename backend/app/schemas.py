from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models import Severity


# ─── Request Schemas ─────────────────────────────────────────────────────────

class LogCreate(BaseModel):
    timestamp: datetime | None = None
    message: str = Field(..., min_length=1, max_length=10_000)
    severity: Severity
    source: str = Field(..., min_length=1, max_length=255)

    @field_validator("message")
    @classmethod
    def message_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("message must not be blank")
        return v

    @field_validator("source")
    @classmethod
    def source_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("source must not be blank")
        return v


class LogUpdate(BaseModel):
    timestamp: datetime | None = None
    message: str | None = Field(None, min_length=1, max_length=10_000)
    severity: Severity | None = None
    source: str | None = Field(None, min_length=1, max_length=255)


# ─── Response Schemas ─────────────────────────────────────────────────────────

class LogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: datetime
    message: str
    severity: Severity
    source: str
    created_at: datetime


class PaginatedLogs(BaseModel):
    items: list[LogRead]
    total: int
    page: int
    page_size: int
    pages: int


# ─── Query Parameter Schemas ──────────────────────────────────────────────────

class LogQueryParams(BaseModel):
    start: datetime | None = None
    end: datetime | None = None
    severity: list[Severity] | None = None
    source: str | None = None
    search: str | None = None
    sort_by: Literal["timestamp", "severity", "source", "created_at"] = "timestamp"
    order: Literal["asc", "desc"] = "desc"
    page: int = Field(1, ge=1)
    page_size: int = Field(50, ge=1, le=500)

    @model_validator(mode="after")
    def validate_date_range(self) -> "LogQueryParams":
        if self.start and self.end and self.start > self.end:
            raise ValueError("start must be before end")
        return self


class AnalyticsQueryParams(BaseModel):
    start: datetime | None = None
    end: datetime | None = None
    severity: list[Severity] | None = None
    source: str | None = None
    interval: Literal["hour", "day", "week", "month"] = "day"
    group_by: Literal["severity", "source"] = "severity"

    @model_validator(mode="after")
    def validate_date_range(self) -> "AnalyticsQueryParams":
        if self.start and self.end and self.start > self.end:
            raise ValueError("start must be before end")
        return self


# ─── Analytics Response Schemas ───────────────────────────────────────────────

class SeverityCount(BaseModel):
    severity: Severity
    count: int


class SourceCount(BaseModel):
    source: str
    count: int


class AnalyticsSummary(BaseModel):
    total: int
    by_severity: list[SeverityCount]
    by_source: list[SourceCount]


class TimeseriesPoint(BaseModel):
    bucket: datetime
    label: str
    count: int


class TimeseriesResponse(BaseModel):
    interval: str
    group_by: str
    data: list[TimeseriesPoint]


class HistogramBar(BaseModel):
    severity: Severity
    count: int


class HistogramResponse(BaseModel):
    data: list[HistogramBar]
