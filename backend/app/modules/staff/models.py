"""
Staff Profile Model - Thông tin chi tiết nhân viên Spa.
Quan hệ 1-1 với bảng users của Supabase Auth.
"""
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.core.enums import UserRole
from app.modules.skills.models import Skill
from app.modules.staff.link_models import StaffSkillLink

if TYPE_CHECKING:
    from app.modules.scheduling.models import StaffSchedule



class UserProfile(SQLModel, table=True):
    __tablename__ = "profiles"

    id: UUID = Field(primary_key=True)
    email: str | None = None
    full_name: str | None = None
    phone_number: str | None = None
    avatar_url: str | None = None
    role: UserRole = Field(default=UserRole.CUSTOMER)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )

class StaffProfile(SQLModel, table=True):
    """
    Hồ sơ nhân viên. Primary Key là user_id từ Supabase Auth.
    Liên kết 1-1 với bảng profiles.
    """
    __tablename__ = "staff_profiles"

    user_id: UUID = Field(primary_key=True, foreign_key="profiles.id")  # FK to public.profiles(id)
    title: str = Field(max_length=100, default="Kỹ thuật viên")
    bio: str | None = None
    color_code: str = Field(max_length=7, default="#6366F1")
    created_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        sa_type=DateTime(timezone=True),
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Note: email, role, is_active are now in public.profiles table
    # We can access them via join if needed.

    profile: UserProfile = Relationship()
    skills: list[Skill] = Relationship(
        back_populates="staff_members",
        link_model=StaffSkillLink
    )
    schedules: list["StaffSchedule"] = Relationship(back_populates="staff")
