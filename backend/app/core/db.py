from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from app.core.config import settings

# Engine cho SQLModel hỗ trợ async
# echo=True để log SQL (tắt trong production)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True
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
