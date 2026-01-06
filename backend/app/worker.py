"""
ARQ Worker - Background job worker cho booking optimization.

Chạy với: arq app.worker.WorkerSettings
Hoặc: uv run arq app.worker.WorkerSettings

Cú pháp theo ARQ docs: https://arq-docs.helpmanual.io/
"""
from uuid import UUID

from arq import create_pool
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.db import engine
from app.core.redis import get_redis_settings


async def startup(ctx: dict):
    """Khởi tạo resources khi worker start."""
    print("🚀 ARQ Worker starting up...")

    # WHY: Import model registry để SQLAlchemy resolve relationships
    import app.core.models  # noqa: F401

    # WHY: Tạo DB session factory để dùng trong các job
    from sqlalchemy.ext.asyncio import async_sessionmaker
    ctx["session_factory"] = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    print("✅ Database session factory initialized")


async def shutdown(ctx: dict):
    """Cleanup khi worker shutdown."""
    print("🛑 ARQ Worker shutting down...")

    # Dispose engine connections
    await engine.dispose()
    print("✅ Database connections closed")


async def optimize_booking(ctx: dict, booking_id: str):
    """
    Job chính: Tối ưu hóa phân bổ Staff + Resource cho một booking.

    Args:
        ctx: ARQ context chứa session_factory từ startup
        booking_id: UUID của booking cần optimize
    """
    print(f"⚙️ Starting optimization for booking: {booking_id}")

    session_factory = ctx["session_factory"]

    try:
        async with session_factory() as session:
            # Import models
            from app.modules.bookings.models import Booking, BookingItem
            from app.modules.bookings import service as booking_service
            from sqlmodel import select

            # 1. Load booking với items (đã eager loaded)
            booking = await booking_service.get_booking_by_id(session, UUID(booking_id))
            if not booking:
                print(f"❌ Booking {booking_id} not found")
                return {"success": False, "error": "Booking not found"}

            if not booking.items:
                print(f"❌ Booking {booking_id} has no items")
                return {"success": False, "error": "Booking has no items"}

            print(f"📦 Found {len(booking.items)} items in booking")

            # 2. Đơn giản hóa: Cập nhật optimization status mà không chạy solver
            # WHY: Test flow trước, sau đó mới tích hợp solver
            from datetime import datetime, timezone

            booking.optimization_status = "FEASIBLE"
            booking.optimization_message = "Đã xử lý thành công (simplified test)"
            booking.optimized_at = datetime.now(timezone.utc)
            booking.status = "CONFIRMED"

            session.add(booking)
            await session.commit()

            print(f"✅ Optimization completed for booking: {booking_id}")

            return {
                "success": True,
                "status": "FEASIBLE",
                "message": "Test optimization completed",
            }

    except Exception as e:
        print(f"❌ Error during optimization: {e}")
        return {"success": False, "error": str(e)}


# WHY: WorkerSettings class theo chuẩn ARQ
# ARQ CLI sẽ tìm class này: arq app.worker.WorkerSettings
class WorkerSettings:
    """Cấu hình ARQ Worker."""

    functions = [optimize_booking]
    on_startup = startup
    on_shutdown = shutdown

    # WHY: ARQ cần redis_settings là attribute, không phải method
    redis_settings = get_redis_settings()

    # Cấu hình worker
    max_jobs = 10  # Số job tối đa chạy đồng thời
    job_timeout = 300  # 5 phút timeout cho mỗi job
    keep_result = 3600  # Giữ kết quả 1 giờ
    poll_delay = 0.5  # Poll interval (giây)


async def enqueue_optimization_job(booking_id: UUID):
    """
    Helper function để enqueue job từ FastAPI.
    Được gọi từ booking router sau khi tạo booking.
    """
    redis = await create_pool(get_redis_settings())
    job = await redis.enqueue_job("optimize_booking", str(booking_id))
    await redis.close()
    return job
