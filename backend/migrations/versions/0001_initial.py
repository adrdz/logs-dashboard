"""initial

Revision ID: 0001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE TYPE severity_enum AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL')")

    op.create_table(
        "logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column(
            "timestamp",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column(
            "severity",
            sa.Enum("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL", name="severity_enum"),
            nullable=False,
        ),
        sa.Column("source", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_logs_timestamp", "logs", ["timestamp"])
    op.create_index("ix_logs_severity", "logs", ["severity"])
    op.create_index("ix_logs_source", "logs", ["source"])
    op.create_index("ix_logs_timestamp_severity", "logs", ["timestamp", "severity"])
    op.create_index("ix_logs_timestamp_source", "logs", ["timestamp", "source"])


def downgrade() -> None:
    op.drop_index("ix_logs_timestamp_source", table_name="logs")
    op.drop_index("ix_logs_timestamp_severity", table_name="logs")
    op.drop_index("ix_logs_source", table_name="logs")
    op.drop_index("ix_logs_severity", table_name="logs")
    op.drop_index("ix_logs_timestamp", table_name="logs")
    op.drop_table("logs")
    op.execute("DROP TYPE severity_enum")
