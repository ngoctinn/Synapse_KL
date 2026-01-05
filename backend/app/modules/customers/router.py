from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.modules.customers import service
from app.modules.customers.schemas import CustomerCreate, CustomerRead, CustomerUpdate

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("/", response_model=List[CustomerRead])
async def list_customers(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None, description="Search by name or phone number"),
    session: AsyncSession = Depends(get_db),
):
    """
    List all customers with pagination and optional search.
    """
    return await service.get_all_customers(session, skip, limit, search)


@router.get("/{customer_id}", response_model=CustomerRead)
async def get_customer(
    customer_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    """
    Get customer details by ID.
    """
    customer = await service.get_customer_by_id(session, customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return customer


@router.post("/", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_in: CustomerCreate,
    session: AsyncSession = Depends(get_db),
):
    """
    Create a new customer profile.
    """
    # Check if phone already exists
    existing = await service.get_customer_by_phone(session, customer_in.phone_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer with this phone number already exists"
        )

    return await service.create_customer(session, customer_in)


@router.put("/{customer_id}", response_model=CustomerRead)
async def update_customer(
    customer_id: UUID,
    customer_in: CustomerUpdate,
    session: AsyncSession = Depends(get_db),
):
    """
    Update customer profile.
    """
    customer = await service.update_customer(session, customer_id, customer_in)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    """
    Delete a customer profile.
    """
    success = await service.delete_customer(session, customer_id)
    if not success:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return None
