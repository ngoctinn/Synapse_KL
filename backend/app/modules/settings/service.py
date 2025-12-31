from sqlmodel import select, delete
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import time

from .models import OperatingHour, ExceptionDate
from .schemas import OperationalSettingsUpdate, OperationalSettingsRead, OperatingHourBase, ExceptionDateBase

class SettingsService:
    """
    Quy tắc nghiệp vụ về thời gian (Domain Rules):
    - Midnight Boundary: 00:00:00 được coi là điểm bắt đầu ngày mới.
    - 24-Hour Operation: Nếu is_closed=False AND open_time == close_time (ví dụ: 00:00 - 00:00)
      -> Hệ thống hiểu là mở cửa 24/24h.
    - Overnight Shift: Nếu close_time < open_time (ví dụ: 22:00 - 02:00)
      -> Hệ thống hiểu close_time thuộc về ngày hôm sau (+1 day).
    """
    async def get_settings(self, db: AsyncSession) -> OperationalSettingsRead:
        """
        Lấy cấu hình vận hành hiện tại.
        Nếu chưa có dữ liệu, trả về cấu hình mặc định (08:00 - 20:00).
        """
        # Fetch Operating Hours
        result_hours = await db.exec(select(OperatingHour).order_by(OperatingHour.day_of_week))
        hours = result_hours.all()

        # If empty, return default
        if not hours:
            hours = self._get_default_hours()

        # Fetch Exception Dates
        result_dates = await db.exec(select(ExceptionDate).order_by(ExceptionDate.date))
        dates = result_dates.all()

        return OperationalSettingsRead(
            regular_operating_hours=hours,
            exception_dates=dates
        )

    async def update_settings(self, db: AsyncSession, settings: OperationalSettingsUpdate) -> OperationalSettingsRead:
        """
        Cập nhật toàn bộ cấu hình vận hành (Transactional Replace).
        Xóa cũ -> Thêm mới để đảm bảo đồng bộ.
        """
        async with db.begin():
            # Clear existing data
            await db.exec(delete(OperatingHour))
            await db.exec(delete(ExceptionDate))

            # Insert new data
            # Convert Pydantic models to SQLModel instances
            db.add_all([OperatingHour(**h.model_dump()) for h in settings.regular_operating_hours])
            db.add_all([ExceptionDate(**d.model_dump()) for d in settings.exception_dates])

            # Commit handled by context manager on exit

        # Return updated state
        return await self.get_settings(db)

    def _get_default_hours(self) -> list[OperatingHour]:
        """Tạo cấu hình mặc định: Tất cả các ngày đều mở từ 08:00 - 20:00."""
        defaults = []
        for day in range(7): # 0=Sun to 6=Sat (SQLModel Model uses 0-6 convention)
            defaults.append(OperatingHour(
                day_of_week=day,
                open_time=time(8, 0),
                close_time=time(20, 0),
                is_closed=False
            ))
        return defaults

settings_service = SettingsService()
