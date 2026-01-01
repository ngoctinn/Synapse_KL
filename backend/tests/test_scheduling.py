from datetime import date
from uuid import uuid4

import pytest
from httpx import AsyncClient


@pytest.fixture
async def sample_shift(client: AsyncClient):
    shift_data = {
        "name": "Ca Sang",
        "start_time": "08:00:00",
        "end_time": "12:00:00",
        "color_code": "#00FF00"
    }
    response = await client.post("/api/v1/scheduling/shifts", json=shift_data)
    return response.json()

@pytest.fixture
async def sample_staff(client: AsyncClient):
    user_id = str(uuid4())
    staff_data = {
        "user_id": user_id,
        "full_name": "Test Technician"
    }
    response = await client.post("/api/v1/staff/", json=staff_data)
    return response.json()

@pytest.mark.anyio
async def test_create_shift(client: AsyncClient):
    shift_data = {
        "name": "Ca Chieu",
        "start_time": "13:00:00",
        "end_time": "17:00:00"
    }
    response = await client.post("/api/v1/scheduling/shifts", json=shift_data)
    assert response.status_code == 201
    assert response.json()["name"] == "Ca Chieu"

@pytest.mark.anyio
async def test_list_shifts(client: AsyncClient):
    response = await client.get("/api/v1/scheduling/shifts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.anyio
async def test_create_schedule(client: AsyncClient, sample_staff, sample_shift):
    schedule_data = {
        "staff_id": sample_staff["user_id"],
        "shift_id": sample_shift["id"],
        "work_date": str(date.today()),
        "status": "DRAFT"
    }
    response = await client.post("/api/v1/scheduling/schedules", json=schedule_data)
    assert response.status_code == 201
    assert response.json()["staff_id"] == sample_staff["user_id"]

@pytest.mark.anyio
async def test_list_schedules(client: AsyncClient):
    today = str(date.today())
    response = await client.get(f"/api/v1/scheduling/schedules?start_date={today}&end_date={today}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.anyio
async def test_update_schedule_status(client: AsyncClient, sample_staff, sample_shift):
    # Prepare schedule
    today = str(date.today())
    res = await client.post("/api/v1/scheduling/schedules", json={
        "staff_id": sample_staff["user_id"],
        "shift_id": sample_shift["id"],
        "work_date": today
    })
    schedule_id = res.json()["id"]

    response = await client.patch(f"/api/v1/scheduling/schedules/{schedule_id}/status?new_status=PUBLISHED")
    assert response.status_code == 200
    assert response.json()["status"] == "PUBLISHED"

@pytest.mark.anyio
async def test_delete_schedule(client: AsyncClient, sample_staff, sample_shift):
    today = str(date.today())
    res = await client.post("/api/v1/scheduling/schedules", json={
        "staff_id": sample_staff["user_id"],
        "shift_id": sample_shift["id"],
        "work_date": today
    })
    schedule_id = res.json()["id"]

    response = await client.delete(f"/api/v1/scheduling/schedules/{schedule_id}")
    assert response.status_code == 204
