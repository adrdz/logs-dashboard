from datetime import datetime
from typing import Literal

from pydantic import BaseModel, model_validator

from app.logs.models import Severity


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
