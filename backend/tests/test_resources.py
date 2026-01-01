import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_resource_groups_crud(client: AsyncClient):
    # 1. Create Group
    group_data = {
        "name": "Giường Massage",
        "type": "BED",
        "description": "Giường massage tiêu chuẩn"
    }
    response = await client.post("/api/v1/resources/groups", json=group_data)
    assert response.status_code == 201, response.text
    group = response.json()
    assert group["name"] == group_data["name"]
    group_id = group["id"]

    # 2. Get Group
    response = await client.get(f"/api/v1/resources/groups/{group_id}")
    assert response.status_code == 200
    assert response.json()["id"] == group_id

    # 3. List Groups
    response = await client.get("/api/v1/resources/groups")
    assert response.status_code == 200
    assert len(response.json()) >= 1

@pytest.mark.anyio
async def test_resources_crud(client: AsyncClient):
    # Setup: Create a group first
    group_data = {"name": "Test Group", "type": "EQUIPMENT"}
    g_resp = await client.post("/api/v1/resources/groups", json=group_data)
    group_id = g_resp.json()["id"]

    # 1. Create Resource
    res_data = {
        "name": "Máy RF 01",
        "code": "RF01",
        "group_id": group_id,
        "status": "ACTIVE"
    }
    response = await client.post("/api/v1/resources", json=res_data)
    assert response.status_code == 201, response.text
    res = response.json()
    assert res["name"] == res_data["name"]
    res_id = res["id"]

    # 2. List Resources
    response = await client.get("/api/v1/resources")
    assert response.status_code == 200
    found = any(r["id"] == res_id for r in response.json())
    assert found

    # 3. Update Resource
    update_data = {"status": "MAINTENANCE"}
    response = await client.put(f"/api/v1/resources/{res_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["status"] == "MAINTENANCE"
