import pytest
from httpx import AsyncClient

@pytest.mark.anyio
async def test_list_skills_empty(client: AsyncClient):
    response = await client.get("/api/v1/skills")
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.anyio
async def test_create_and_get_skill(client: AsyncClient):
    # Create
    skill_data = {
        "name": "Massage Thái",
        "code": "MASSAGE_THAI",
        "description": "Kỹ thuật massage cổ truyền Thái Lan"
    }
    response = await client.post("/api/v1/skills", json=skill_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == skill_data["name"]
    assert data["code"] == skill_data["code"]
    skill_id = data["id"]

    # Get by ID
    response = await client.get(f"/api/v1/skills/{skill_id}")
    assert response.status_code == 200
    assert response.json()["name"] == skill_data["name"]

@pytest.mark.anyio
async def test_create_duplicate_skill_code(client: AsyncClient):
    skill_data = {
        "name": "Chăm sóc da",
        "code": "FACIAL",
    }
    await client.post("/api/v1/skills", json=skill_data)

    # Duplicate post
    response = await client.post("/api/v1/skills", json=skill_data)
    assert response.status_code == 409
    assert "đã tồn tại" in response.json()["detail"]
