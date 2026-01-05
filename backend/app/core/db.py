import ssl

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import settings

# Create SSL context based on configuration
# SECURITY: Only disable SSL verification in dev environments with self-signed certs
if settings.DISABLE_SSL_VERIFY:
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
else:
    ssl_context = ssl.create_default_context()

# Determine connect_args based on database type
connect_args = {}
if settings.DATABASE_URL.startswith("postgresql"):
    connect_args = {"ssl": ssl_context}
elif settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
    connect_args=connect_args
)

# SessionLocal factory để tạo session async
# expire_on_commit=False là bắt buộc cho asyncpg
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def init_db():
    """ Khởi tạo database, tạo các bảng nếu chưa có. """
    async with engine.begin() as conn:
        # SQLModel sử dụng Metadata của SQLAlchemy
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_db():
    """
    Dependency cung cấp AsyncSession cho các request.
    Tự động đóng session sau khi xử lý xong.
    """
    async with AsyncSessionLocal() as session:
        yield session
