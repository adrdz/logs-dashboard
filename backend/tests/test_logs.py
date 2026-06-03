"""Integration tests for the logs CRUD endpoints."""
import pytest
from httpx import AsyncClient


@pytest.fixture
def log_payload():
    return {
        "message": "Test log entry",
        "severity": "INFO",
        "source": "test-service",
    }


class TestCreateLog:
    async def test_creates_log(self, client: AsyncClient, log_payload):
        resp = await client.post("/api/logs", json=log_payload)
        assert resp.status_code == 201
        data = resp.json()
        assert data["message"] == log_payload["message"]
        assert data["severity"] == "INFO"
        assert data["source"] == "test-service"
        assert "id" in data
        assert "timestamp" in data

    async def test_rejects_blank_message(self, client: AsyncClient):
        resp = await client.post("/api/logs", json={"message": "   ", "severity": "INFO", "source": "svc"})
        assert resp.status_code == 422

    async def test_rejects_invalid_severity(self, client: AsyncClient):
        resp = await client.post("/api/logs", json={"message": "hi", "severity": "BOGUS", "source": "svc"})
        assert resp.status_code == 422

    async def test_rejects_missing_fields(self, client: AsyncClient):
        resp = await client.post("/api/logs", json={"message": "hi"})
        assert resp.status_code == 422


class TestGetLog:
    async def test_get_existing(self, client: AsyncClient, log_payload):
        create_resp = await client.post("/api/logs", json=log_payload)
        log_id = create_resp.json()["id"]

        resp = await client.get(f"/api/logs/{log_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == log_id

    async def test_get_missing_returns_404(self, client: AsyncClient):
        resp = await client.get("/api/logs/99999")
        assert resp.status_code == 404


class TestUpdateLog:
    async def test_partial_update(self, client: AsyncClient, log_payload):
        create_resp = await client.post("/api/logs", json=log_payload)
        log_id = create_resp.json()["id"]

        resp = await client.patch(f"/api/logs/{log_id}", json={"severity": "ERROR", "message": "Updated"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["severity"] == "ERROR"
        assert data["message"] == "Updated"

    async def test_update_missing_returns_404(self, client: AsyncClient):
        resp = await client.patch("/api/logs/99999", json={"message": "x"})
        assert resp.status_code == 404


class TestDeleteLog:
    async def test_delete_existing(self, client: AsyncClient, log_payload):
        create_resp = await client.post("/api/logs", json=log_payload)
        log_id = create_resp.json()["id"]

        del_resp = await client.delete(f"/api/logs/{log_id}")
        assert del_resp.status_code == 204

        get_resp = await client.get(f"/api/logs/{log_id}")
        assert get_resp.status_code == 404

    async def test_delete_missing_returns_404(self, client: AsyncClient):
        resp = await client.delete("/api/logs/99999")
        assert resp.status_code == 404


class TestListLogs:
    async def test_returns_paginated_response(self, client: AsyncClient, log_payload):
        # Create a few logs
        for i in range(3):
            await client.post("/api/logs", json={**log_payload, "message": f"Log {i}"})

        resp = await client.get("/api/logs")
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert data["page"] == 1

    async def test_pagination(self, client: AsyncClient, log_payload):
        for i in range(5):
            await client.post("/api/logs", json={**log_payload, "message": f"P-Log {i}"})

        resp = await client.get("/api/logs?page=1&page_size=2")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["items"]) <= 2

    async def test_severity_filter(self, client: AsyncClient):
        await client.post("/api/logs", json={"message": "err log", "severity": "ERROR", "source": "svc"})
        await client.post("/api/logs", json={"message": "debug log", "severity": "DEBUG", "source": "svc"})

        resp = await client.get("/api/logs?severity=ERROR")
        assert resp.status_code == 200
        items = resp.json()["items"]
        assert all(item["severity"] == "ERROR" for item in items)

    async def test_search_filter(self, client: AsyncClient):
        await client.post("/api/logs", json={"message": "unique-xyz-message", "severity": "INFO", "source": "svc"})

        resp = await client.get("/api/logs?search=unique-xyz")
        assert resp.status_code == 200
        items = resp.json()["items"]
        assert any("unique-xyz" in item["message"] for item in items)

    async def test_sort_by_supported_column(self, client: AsyncClient, log_payload):
        await client.post("/api/logs", json=log_payload)
        resp = await client.get("/api/logs?sort_by=severity&order=asc")
        assert resp.status_code == 200

    async def test_sort_by_message_rejected(self, client: AsyncClient):
        # The UI disables sorting on `message`; the API contract rejects it too.
        resp = await client.get("/api/logs?sort_by=message")
        assert resp.status_code == 422

    async def test_invalid_date_range_returns_422(self, client: AsyncClient):
        resp = await client.get("/api/logs?start=2024-12-31T00:00:00Z&end=2024-01-01T00:00:00Z")
        assert resp.status_code == 422


class TestCsvExport:
    async def test_export_returns_csv(self, client: AsyncClient, log_payload):
        await client.post("/api/logs", json=log_payload)
        resp = await client.get("/api/logs/export")
        assert resp.status_code == 200
        assert "text/csv" in resp.headers["content-type"]
        content = resp.text
        assert "id,timestamp,severity,source,message,created_at" in content
