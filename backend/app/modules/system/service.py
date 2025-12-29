from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, delete
from typing import List, Dict, Any
from app.modules.system.models import RegularOperatingHour, ExceptionDate
from datetime import date, time

class SystemService:
    """
    Lớp Service xử lý logic hệ thống và cấu hình vận hành.
    """
    async def check_health(self):
        return {
            "status": "healthy",
            "database": "connected",
            "version": "0.1.0"
        }

    async def get_operational_settings(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Lấy toàn bộ cấu hình vận hành (giờ định kỳ và ngày ngoại lệ).
        """
        # Lấy giờ định kỳ
        stmt_regular = select(RegularOperatingHour).order_by(RegularOperatingHour.day_of_week)
        result_regular = await db.execute(stmt_regular)
        regular_hours = result_regular.scalars().all()

        # Lấy ngày ngoại lệ (từ hôm nay trở đi)
        today = date.today()
        stmt_exceptions = select(ExceptionDate).where(ExceptionDate.exception_date >= today).order_by(ExceptionDate.exception_date)
        result_exceptions = await db.execute(stmt_exceptions)
        exceptions = result_exceptions.scalars().all()

        return {
            "regular_operating_hours": regular_hours,
            "exception_dates": exceptions
        }

    async def update_settings(self, db: AsyncSession, settings_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cập nhật toàn bộ cấu hình vận hành.
        Sử dụng chiến lược: Xóa cũ và thêm mới (batch update).
        """
        # 1. Cập nhật giờ định kỳ
        if "regular_operating_hours" in settings_data:
            await db.execute(delete(RegularOperatingHour))
            for hour_data in settings_data["regular_operating_hours"]:
                # Chuyển đổi string sang time nếu cần (FastAPI Pydantic thường lo việc này nhưng đây làDict)
                # Tuy nhiên nếu dùng Pydantic models trong router thì data sẽ chuẩn hơn.
                db_hour = RegularOperatingHour(**hour_data)
                db.add(db_hour)

        # 2. Cập nhật ngày ngoại lệ
        if "exception_dates" in settings_data:
            await db.execute(delete(ExceptionDate))
            for exc_data in settings_data["exception_dates"]:
                db_exc = ExceptionDate(**exc_data)
                db.add(db_exc)

        await db.commit()
        return await self.get_operational_settings(db)

system_service = SystemService()

