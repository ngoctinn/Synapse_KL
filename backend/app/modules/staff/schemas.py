"""
Staff Schemas - DTOs cho request/response của Staff API.
"""
from uuid import UUID

from pydantic import ConfigDict, EmailStr
from sqlmodel import SQLModel


class StaffProfileCreate(SQLModel):
    """Schema tạo mới StaffProfile sau khi user được invite."""
    user_id: UUID
    full_name: str
    title: str = "Kỹ thuật viên"
    bio: str | None = None
    color_code: str = "#6366F1"


class StaffProfileUpdate(SQLModel):
    """Schema cập nhật thông tin nhân viên."""
    full_name: str | None = None
    title: str | None = None
    bio: str | None = None
    color_code: str | None = None
    is_active: bool | None = None


class StaffProfileRead(SQLModel):
    """Schema trả về cho client."""
    user_id: UUID
    full_name: str
    title: str
    bio: str | None = None
    color_code: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class StaffProfileReadWithSkills(StaffProfileRead):
    """Schema trả về kèm danh sách skill IDs."""
    skill_ids: list[UUID] = []


class StaffInviteRequest(SQLModel):
    """Schema yêu cầu mời nhân viên mới qua email."""
    email: EmailStr
    full_name: str
    title: str = "Kỹ thuật viên"
    role: str = "technician"


class StaffSkillsUpdate(SQLModel):
    """Schema cập nhật danh sách kỹ năng cho nhân viên."""
    skill_ids: list[UUID]
