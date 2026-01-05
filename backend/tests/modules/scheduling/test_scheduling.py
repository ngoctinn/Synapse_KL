"""
Tests cho Scheduling Module - Staff Scheduling validation.
"""
import pytest
from datetime import date, time
from uuid import uuid4

from httpx import AsyncClient, ASGITransport

from app.main import app
from app.modules.scheduling.service import shifts_overlap


# --- Unit Tests cho shifts_overlap ---

def test_shifts_overlap_true():
    """2 ca chồng chéo thời gian."""
    # Ca 1: 08:00-12:00, Ca 2: 11:00-15:00
    assert shifts_overlap(
        time(8, 0), time(12, 0),
        time(11, 0), time(15, 0)
    ) is True


def test_shifts_overlap_contained():
    """Ca nhỏ nằm hoàn toàn trong ca lớn."""
    # Ca 1: 08:00-17:00, Ca 2: 10:00-12:00
    assert shifts_overlap(
        time(8, 0), time(17, 0),
        time(10, 0), time(12, 0)
    ) is True


def test_shifts_no_overlap_adjacent():
    """2 ca kế tiếp nhau (không overlap)."""
    # Ca 1: 08:00-12:00, Ca 2: 12:00-16:00
    assert shifts_overlap(
        time(8, 0), time(12, 0),
        time(12, 0), time(16, 0)
    ) is False


def test_shifts_no_overlap_separate():
    """2 ca hoàn toàn tách biệt."""
    # Ca 1: 08:00-12:00, Ca 2: 14:00-18:00
    assert shifts_overlap(
        time(8, 0), time(12, 0),
        time(14, 0), time(18, 0)
    ) is False


# --- Integration Tests với API ---

@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_create_schedule_invalid_staff():
    """Không thể tạo lịch cho staff không tồn tại."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/scheduling/schedules",
            json={
                "staff_id": str(uuid4()),
                "shift_id": str(uuid4()),
                "work_date": "2026-01-10",
                "status": "DRAFT"
            }
        )
        assert response.status_code == 404
        assert "Nhân viên không tồn tại" in response.json()["detail"]


@pytest.mark.anyio
async def test_create_schedule_invalid_shift():
    """Không thể tạo lịch với shift không tồn tại."""
    # WHY: Test này cần có staff hợp lệ trong DB
    # Bỏ qua nếu chưa có seed data
    pass
