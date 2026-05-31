import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Severity(str, enum.Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class Log(Base):
    __tablename__ = "logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[Severity] = mapped_column(
        Enum(Severity, name="severity_enum"),
        nullable=False,
        index=True,
    )
    source: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        Index("ix_logs_timestamp_severity", "timestamp", "severity"),
        Index("ix_logs_timestamp_source", "timestamp", "source"),
    )
