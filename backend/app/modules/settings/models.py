from __future__ import annotations

from datetime import date as date_type
from datetime import time
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class OperatingHour(SQLModel, table=True):
    __tablename__ = "operating_hours"

    # 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    day_of_week: int = Field(primary_key=True, ge=0, le=6, description="0=Sun, 6=Sat")
    open_time: time
    close_time: time
    is_closed: bool = Field(default=False)

class ExceptionDate(SQLModel, table=True):
    __tablename__ = "exception_dates"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    date: date_type = Field(unique=True, index=True)
    reason: str | None = None
    is_closed: bool = Field(default=False)
    open_time: time | None = None
    close_time: time | None = None
