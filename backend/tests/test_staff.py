from uuid import uuid4

import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_create_staff_profile(client: AsyncClient):
    user_id = str(uuid4())
    staff_data = {
        "user_id": user_id,
        "full_name": "Nguyen Van A",
        "title": "Kỹ thuật viên chính",
        "bio": "Chuyên về massage trị liệu",
        "color_code": "#FF5733"
    }
    response = await client.post("/api/v1/staff/", json=staff_data)
    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == user_id
    assert data["full_name"] == "Nguyen Van A"

@pytest.mark.anyio
async def test_get_all_staff(client: AsyncClient):
    response = await client.get("/api/v1/staff/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.anyio
async def test_get_staff_by_id(client: AsyncClient):
    # Create one first
    user_id = str(uuid4())
    await client.post("/api/v1/staff/", json={
        "user_id": user_id,
        "full_name": "Test Staff",
        "title": "Test"
    })

    response = await client.get(f"/api/v1/staff/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == user_id

@pytest.mark.anyio
async def test_update_staff_profile(client: AsyncClient):
    user_id = str(uuid4())
    await client.post("/api/v1/staff/", json={
        "user_id": user_id,
        "full_name": "Old Name"
    })

    update_data = {"full_name": "New Name"}
    response = await client.put(f"/api/v1/staff/{user_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["full_name"] == "New Name"

@pytest.mark.anyio
async def test_delete_staff_profile(client: AsyncClient):
    user_id = str(uuid4())
    await client.post("/api/v1/staff/", json={
        "user_id": user_id,
        "full_name": "To Delete"
    })

    response = await client.delete(f"/api/v1/staff/{user_id}")
    assert response.status_code == 204

    # Verify soft delete
    response = await client.get(f"/api/v1/staff/{user_id}")
    assert response.json()["is_active"] is False
