
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_db
from app.main import app
# Ensure Models are registered in metadata
from app.modules.customers.models import Customer
# Note: Add other models here only if strictly needed for foreign keys
# from app.modules.staff.models import StaffProfile

# Use an in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# connect_args={"check_same_thread": False} is required for SQLite
engine = create_async_engine(
    TEST_DATABASE_URL,
    future=True,
    connect_args={"check_same_thread": False}
)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def override_get_db():
    async with AsyncSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

@pytest.fixture(scope="function", autouse=True)
async def init_test_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

@pytest.fixture
async def client():
    # Use explicit transport and base_url to avoid connection errors
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
