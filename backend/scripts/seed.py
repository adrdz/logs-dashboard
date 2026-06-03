"""
Seed script: generates ~3000 realistic log entries spread across the last 30 days.
Run: python scripts/seed.py [--reset]
"""
import argparse
import asyncio
import os
import random
import sys
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import delete, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.logs.models import Log, Severity

SOURCES = [
    "auth-service",
    "payments-api",
    "user-service",
    "notification-worker",
    "api-gateway",
    "scheduler",
]

SEVERITY_WEIGHTS = [
    (Severity.DEBUG, 15),
    (Severity.INFO, 50),
    (Severity.WARNING, 20),
    (Severity.ERROR, 12),
    (Severity.CRITICAL, 3),
]

MESSAGE_TEMPLATES = {
    Severity.DEBUG: [
        "Processing request id={req_id}",
        "Cache miss for key user:{user_id}",
        "DB query executed in {ms}ms",
        "Retry attempt {n} for task {task}",
    ],
    Severity.INFO: [
        "User {user_id} logged in successfully",
        "Payment {payment_id} processed",
        "Email notification sent to user {user_id}",
        "Scheduled job {job} started",
        "API request completed in {ms}ms",
        "Health check passed",
    ],
    Severity.WARNING: [
        "Rate limit approaching for client {client_id}",
        "Slow DB query detected: {ms}ms",
        "Retrying failed webhook delivery (attempt {n})",
        "Deprecated endpoint accessed: {endpoint}",
        "Memory usage above 80%",
    ],
    Severity.ERROR: [
        "Payment {payment_id} failed: {reason}",
        "Failed to send email to user {user_id}",
        "Database connection timeout after {ms}ms",
        "Unhandled exception in {service}: {error}",
        "Job {job} failed after {n} retries",
    ],
    Severity.CRITICAL: [
        "Database unreachable: {error}",
        "Service {service} is down",
        "Security breach detected from IP {ip}",
        "Data corruption detected in table {table}",
    ],
}

REASONS = ["insufficient funds", "card declined", "network timeout", "invalid card"]
ERRORS = ["NullPointerException", "TimeoutError", "ConnectionRefused"]
ENDPOINTS = ["/api/v1/users", "/api/v1/payments", "/api/legacy/auth"]


def random_message(severity: Severity) -> str:
    template = random.choice(MESSAGE_TEMPLATES[severity])
    return template.format(
        req_id=random.randint(10000, 99999),
        user_id=random.randint(1000, 9999),
        payment_id=f"PAY-{random.randint(100000, 999999)}",
        ms=random.randint(5, 5000),
        n=random.randint(1, 5),
        task=f"task-{random.randint(1, 100)}",
        job=f"job-{random.randint(1, 50)}",
        client_id=random.randint(1, 500),
        endpoint=random.choice(ENDPOINTS),
        reason=random.choice(REASONS),
        service=random.choice(SOURCES),
        error=random.choice(ERRORS),
        ip=f"192.168.{random.randint(0,255)}.{random.randint(0,255)}",
        table=random.choice(["users", "payments", "sessions"]),
    )


def weighted_choice(choices):
    items, weights = zip(*choices)
    return random.choices(items, weights=weights, k=1)[0]


async def seed(reset: bool = False, skip_if_seeded: bool = False) -> None:
    db_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://loguser:logpassword@localhost:5432/logsdb")
    engine = create_async_engine(db_url, echo=False)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async with factory() as session:
        if skip_if_seeded:
            result = await session.execute(text("SELECT COUNT(*) FROM logs"))
            count = result.scalar()
            if count and count > 0:
                print(f"Database already has {count} logs — skipping seed.")
                await engine.dispose()
                return

        if reset:
            await session.execute(delete(Log))
            await session.commit()
            print("Existing logs deleted.")

        now = datetime.now(timezone.utc)
        logs = []
        for _ in range(3000):
            severity = weighted_choice(SEVERITY_WEIGHTS)
            source = random.choice(SOURCES)
            ts = now - timedelta(
                days=random.uniform(0, 30),
                hours=random.uniform(0, 23),
                minutes=random.uniform(0, 59),
            )
            logs.append(Log(
                timestamp=ts,
                message=random_message(severity),
                severity=severity,
                source=source,
            ))

        session.add_all(logs)
        await session.commit()
        print(f"Seeded {len(logs)} log entries.")

    await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Delete existing logs before seeding")
    parser.add_argument("--skip-if-seeded", action="store_true", help="No-op if the table already has rows")
    args = parser.parse_args()
    asyncio.run(seed(reset=args.reset, skip_if_seeded=args.skip_if_seeded))
