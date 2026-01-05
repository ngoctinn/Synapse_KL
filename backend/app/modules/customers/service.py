from typing import Optional, Sequence
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.modules.customers.models import Customer
from app.modules.customers.schemas import CustomerCreate, CustomerUpdate


# --- READ OPERATIONS ---

async def get_all_customers(
    session: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None
) -> Sequence[Customer]:
    query = select(Customer).offset(skip).limit(limit)

    if search:
        # Simple search by name or phone
        # Note: In real app, consider full-text search or specialized index
        query = query.where(
            (Customer.full_name.ilike(f"%{search}%")) |
            (Customer.phone_number.ilike(f"%{search}%"))
        )

    result = await session.execute(query)
    return result.scalars().all()


async def get_customer_by_id(session: AsyncSession, customer_id: UUID) -> Optional[Customer]:
    return await session.get(Customer, customer_id)


async def get_customer_by_phone(session: AsyncSession, phone: str) -> Optional[Customer]:
    query = select(Customer).where(Customer.phone_number == phone)
    result = await session.execute(query)
    return result.scalars().first()


# --- WRITE OPERATIONS ---

async def create_customer(session: AsyncSession, customer_in: CustomerCreate) -> Customer:
    # Check for existing phone number to avoid IntegrityError
    # (Although DB has unique constraint, cleaner to check here for nice error if needed,
    # but for concurrency, DB constraint is source of truth. Let's rely on caller to handle duplicates or DB error)

    customer = Customer.model_validate(customer_in)
    session.add(customer)
    await session.commit()
    await session.refresh(customer)
    return customer


async def update_customer(
    session: AsyncSession,
    customer_id: UUID,
    customer_in: CustomerUpdate
) -> Optional[Customer]:
    customer = await session.get(Customer, customer_id)
    if not customer:
        return None

    update_data = customer_in.model_dump(exclude_unset=True)
    customer.sqlmodel_update(update_data)

    session.add(customer)
    await session.commit()
    await session.refresh(customer)
    return customer


async def delete_customer(session: AsyncSession, customer_id: UUID) -> bool:
    customer = await session.get(Customer, customer_id)
    if not customer:
        return False

    await session.delete(customer)
    await session.commit()
    return True
