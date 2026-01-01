import pytest
from httpx import AsyncClient

@pytest.mark.anyio
async def test_service_lifecycle(client: AsyncClient):
    # 1. Setup Dependencies (Category & Skill & ResourceGroup)
    # Category
    cat_resp = await client.post("/api/v1/categories", json={"name": "Trị liệu"})
    cat_id = cat_resp.json()["id"]

    # Skill
    skill_resp = await client.post("/api/v1/skills", json={"name": "Massage Body"})
    skill_id = skill_resp.json()["id"]

    # Resource Group
    group_resp = await client.post("/api/v1/resources/groups", json={"name": "Giường", "type": "BED"})
    group_id = group_resp.json()["id"]

    # 2. Create Service with Relationships
    service_data = {
        "name": "Full Body Massage 60'",
        "category_id": cat_id,
        "duration": 60,
        "price": "500000",
        "skill_ids": [skill_id],
        "resource_requirements": [
            {
                "group_id": group_id,
                "quantity": 1,
                "start_delay": 0,
                "usage_duration": 60
            }
        ]
    }
    response = await client.post("/api/v1/services", json=service_data)
    assert response.status_code == 201, response.text
    svc = response.json()
    svc_id = svc["id"]

    # Assert basic fields
    assert svc["name"] == service_data["name"]

    # Assert Relationships in Response
    assert len(svc["skills"]) == 1
    assert svc["skills"][0]["id"] == skill_id

    assert len(svc["resource_requirements"]) == 1
    assert svc["resource_requirements"][0]["group_id"] == group_id

    # 3. Get Service Details
    response = await client.get(f"/api/v1/services/{svc_id}")
    assert response.status_code == 200
    detail = response.json()
    assert detail["category"]["id"] == cat_id

    # 4. Update Service (Change price & remove skill)
    update_data = {
        "price": "600000",
        "skill_ids": [] # Remove skills
    }
    response = await client.put(f"/api/v1/services/{svc_id}", json=update_data)
    assert response.status_code == 200
    updated = response.json()
    from decimal import Decimal
    assert Decimal(updated["price"]) == Decimal("600000.00")
    assert len(updated["skills"]) == 0

@pytest.mark.anyio
async def test_service_delete_integrity(client: AsyncClient):
    # 1. Setup
    cat_resp = await client.post("/api/v1/categories", json={"name": "Integrity Test Cat"})
    cat_id = cat_resp.json()["id"]

    skill_resp = await client.post("/api/v1/skills", json={"name": "Integrity Test Skill", "code": "INT_SKILL"})
    skill_id = skill_resp.json()["id"]

    group_resp = await client.post("/api/v1/resources/groups", json={"name": "Integrity Test Group", "type": "BED"})
    group_id = group_resp.json()["id"]

    # Create service
    service_data = {
        "name": "Integrity Test Service",
        "category_id": cat_id,
        "duration": 30,
        "price": 100000,
        "skill_ids": [skill_id],
        "resource_requirements": [{"group_id": group_id, "quantity": 1}]
    }
    await client.post("/api/v1/services", json=service_data)

    # 2. Try delete category (Should fail)
    response = await client.delete(f"/api/v1/categories/{cat_id}")
    assert response.status_code == 409
    assert "Danh mục đang chứa" in response.json()["detail"]

    # 3. Try delete skill (Should fail)
    response = await client.delete(f"/api/v1/skills/{skill_id}")
    assert response.status_code == 409
    assert "Skill đang được sử dụng" in response.json()["detail"]

    # 4. Try delete resource group (Should fail)
    response = await client.delete(f"/api/v1/resources/groups/{group_id}")
    assert response.status_code == 409
    assert "Nhóm đang được dịch vụ sử dụng" in response.json()["detail"]

@pytest.mark.anyio
async def test_service_usage_duration_update(client: AsyncClient):
    # 1. Setup
    cat_resp = await client.post("/api/v1/categories", json={"name": "Usage Test"})
    cat_id = cat_resp.json()["id"]

    group_resp = await client.post("/api/v1/resources/groups", json={"name": "Usage Group", "type": "BED"})
    group_id = group_resp.json()["id"]

    service_data = {
        "name": "Usage Service",
        "category_id": cat_id,
        "duration": 60,
        "price": 100000,
        "resource_requirements": [{"group_id": group_id, "quantity": 1, "usage_duration": 30}]
    }
    resp = await client.post("/api/v1/services", json=service_data)
    svc_id = resp.json()["id"]

    # 2. Update usage_duration (Valid)
    update_data = {
        "resource_requirements": [{"group_id": group_id, "quantity": 1, "usage_duration": 45}]
    }
    resp = await client.put(f"/api/v1/services/{svc_id}", json=update_data)
    assert resp.status_code == 200
    assert resp.json()["resource_requirements"][0]["usage_duration"] == 45

    # 3. Update usage_duration (Invalid - exceeds duration 60)
    invalid_update = {
        "resource_requirements": [{"group_id": group_id, "quantity": 1, "usage_duration": 70}]
    }
    resp = await client.put(f"/api/v1/services/{svc_id}", json=invalid_update)
    assert resp.status_code == 400 # Service Layer validation error (HTTPException)
    assert "vượt quá thời gian dịch vụ" in resp.json()["detail"]
