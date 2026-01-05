"""
ARQ Worker - Background job worker cho booking optimization.

Chạy với: arq app.worker.WorkerSettings
Hoặc: uv run arq app.worker.WorkerSettings

Cú pháp theo ARQ docs: https://arq-docs.helpmanual.io/
"""
from uuid import UUID

from arq import create_pool
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import engine
from app.core.redis import get_redis_settings
from app.modules.bookings.optimizer.solver import (
    BookingOptimizer,
    OptimizationInput,
    ResourceAvailability,
    ServiceData,
    StaffAvailability,
)


async def startup(ctx: dict):
    """Khởi tạo resources khi worker start."""
    print("🚀 ARQ Worker starting up...")

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

    async with session_factory() as session:
        # 1. Load booking với items
        from app.modules.bookings import service as booking_service

        booking = await booking_service.get_booking_by_id(session, UUID(booking_id))
        if not booking:
            print(f"❌ Booking {booking_id} not found")
            return {"success": False, "error": "Booking not found"}

        if not booking.items:
            print(f"❌ Booking {booking_id} has no items")
            return {"success": False, "error": "Booking has no items"}

        # 2. Chuẩn bị dữ liệu cho optimizer
        services_data = []
        for item in booking.items:
            if not item.service:
                continue

            service = item.service
            required_skills = {s.id for s in service.skills} if service.skills else set()
            required_resources = {r.group_id for r in service.resource_requirements} if service.resource_requirements else set()

            services_data.append(ServiceData(
                item_id=item.id,
                service_id=service.id,
                duration=service.duration,
                buffer_time=service.buffer_time,
                required_skill_ids=required_skills,
                required_resource_group_ids=required_resources,
                sequence_order=item.sequence_order,
            ))

        # 3. Query Staff availability
        from app.modules.scheduling import service as scheduling_service
        from app.modules.staff.models import StaffProfile
        from sqlmodel import select
        from sqlalchemy.orm import selectinload

        # Lấy tất cả staff active với skills
        staff_result = await session.execute(
            select(StaffProfile)
            .options(selectinload(StaffProfile.skills))
            .options(selectinload(StaffProfile.profile))
        )
        all_staff = staff_result.scalars().all()

        available_staff = []
        for staff in all_staff:
            if staff.profile and staff.profile.is_active:
                skill_ids = {s.id for s in staff.skills} if staff.skills else set()
                # TODO: Query actual availability từ StaffSchedule
                available_staff.append(StaffAvailability(
                    staff_id=staff.user_id,
                    skill_ids=skill_ids,
                    available_slots=[(booking.preferred_time_start, booking.preferred_time_end)],
                ))

        # 4. Query Resource availability
        from app.modules.resources.models import Resource, ResourceStatus

        resource_result = await session.execute(
            select(Resource).where(Resource.status == ResourceStatus.ACTIVE)
        )
        all_resources = resource_result.scalars().all()

        available_resources = []
        for resource in all_resources:
            if resource.group_id:
                # TODO: Query actual availability từ existing bookings
                available_resources.append(ResourceAvailability(
                    resource_id=resource.id,
                    group_id=resource.group_id,
                    available_slots=[(booking.preferred_time_start, booking.preferred_time_end)],
                ))

        # 5. Chạy optimizer
        optimization_input = OptimizationInput(
            booking_id=booking.id,
            services=services_data,
            available_staff=available_staff,
            available_resources=available_resources,
            time_window=(booking.preferred_time_start, booking.preferred_time_end),
            preferred_staff_id=booking.preferred_staff_id,
        )

        optimizer = BookingOptimizer(optimization_input, timeout_seconds=30)
        result = optimizer.solve()

        print(f"📊 Optimization result: {result.status}")

        # 6. Cập nhật kết quả
        await booking_service.update_booking_optimization_result(
            session,
            booking.id,
            status=result.status,
            message=result.message,
            items_assignment=result.assigned_items,
        )

        return {
            "success": result.success,
            "status": result.status,
            "message": result.message,
            "solve_time_ms": result.solve_time_ms,
        }


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
