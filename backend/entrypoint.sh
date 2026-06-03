#!/bin/bash
set -e

echo "Running Alembic migrations..."
alembic upgrade head

echo "Seeding database (skipped if already seeded)..."
python scripts/seed.py --skip-if-seeded

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
