from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.config import settings
import ssl

# Create custom SSL context that disables verification
# This is needed for Supabase Pooler to avoid 'self-signed certificate' errors
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Query parameters handling:
# If DATABASE_URL already has sslmode, asyncpg might conflict if we pass connect_args ssl.
# However, create_async_engine usually handles this.
# For asyncpg + Supabase, passing the ssl context in connect_args is the most robust way.

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
    connect_args={"ssl": ssl_context}
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
