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
