import pytest
from httpx import AsyncClient

@pytest.mark.anyio
async def test_categories_workflow(client: AsyncClient):
    # 1. Create Category
    cat_data = {"name": "Massage", "description": "Các dịch vụ massage"}
    response = await client.post("/api/v1/categories", json=cat_data)
    assert response.status_code == 201
    cat_id = response.json()["id"]

    # 2. List Categories
    response = await client.get("/api/v1/categories")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # 3. Update Category
    update_data = {"name": "Massage & Spa"}
    response = await client.put(f"/api/v1/categories/{cat_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["name"] == "Massage & Spa"

    # 4. Delete Category (empty)
    response = await client.delete(f"/api/v1/categories/{cat_id}")
    assert response.status_code == 204
