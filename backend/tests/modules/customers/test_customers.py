import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.modules.customers.models import Customer
from app.modules.customers.schemas import CustomerCreate


@pytest.mark.asyncio
async def test_create_customer(client: AsyncClient):
    phone_number = "0909123456"
    full_name = "Test Customer"

    response = await client.post(
        "/api/v1/customers/",
        json={
            "phone_number": phone_number,
            "full_name": full_name,
            "email": "test@example.com"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["phone_number"] == phone_number
    assert data["full_name"] == full_name
    assert "id" in data


@pytest.mark.asyncio
async def test_create_customer_duplicate_phone(client: AsyncClient):
    phone_number = "0987654321"

    # Create first time
    await client.post(
        "/api/v1/customers/",
        json={
            "phone_number": phone_number,
            "full_name": "Customer 1"
        }
    )

    # Create second time (should fail)
    response = await client.post(
        "/api/v1/customers/",
        json={
            "phone_number": phone_number,
            "full_name": "Customer 2"
        }
    )

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_read_customers(client: AsyncClient):
    # Create a customer first
    await client.post(
        "/api/v1/customers/",
        json={
            "phone_number": "0912345678",
            "full_name": "List Customer"
        }
    )

    response = await client.get("/api/v1/customers/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_search_customer(client: AsyncClient):
    unique_name = "UniqueSearchName"
    await client.post(
        "/api/v1/customers/",
        json={
            "phone_number": "0999888777",
            "full_name": unique_name
        }
    )

    response = await client.get(f"/api/v1/customers/?search={unique_name}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["full_name"] == unique_name


@pytest.mark.asyncio
async def test_update_customer(client: AsyncClient):
    # Create
    create_res = await client.post(
        "/api/v1/customers/",
        json={
            "phone_number": "0555555555",
            "full_name": "Update Customer"
        }
    )
    customer_id = create_res.json()["id"]

    # Update
    new_name = "Updated Name"
    response = await client.put(
        f"/api/v1/customers/{customer_id}",
        json={"full_name": new_name}
    )

    assert response.status_code == 200
    assert response.json()["full_name"] == new_name


@pytest.mark.asyncio
async def test_delete_customer(client: AsyncClient):
    # Create
    create_res = await client.post(
        "/api/v1/customers/",
        json={
            "phone_number": "0444444444",
            "full_name": "Delete Customer"
        }
    )
    customer_id = create_res.json()["id"]

    # Delete
    del_res = await client.delete(f"/api/v1/customers/{customer_id}")
    assert del_res.status_code == 204

    # Verify Gone
    get_res = await client.get(f"/api/v1/customers/{customer_id}")
    assert get_res.status_code == 404
