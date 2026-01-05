"""
Staff Schemas - DTOs cho request/response của Staff API.
"""
from uuid import UUID

from pydantic import ConfigDict, EmailStr, model_validator
from sqlmodel import SQLModel
from app.core.enums import UserRole


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
    avatar_url: str | None = None
    is_active: bool | None = None
    role: UserRole | None = None


class StaffProfileRead(SQLModel):
    """Schema trả về cho client."""
    user_id: UUID
    full_name: str | None = None
    title: str | None = None
    bio: str | None = None
    color_code: str | None = None
    avatar_url: str | None = None
    is_active: bool | None = None
    role: UserRole | None = None
    email: str | None = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='before')
    @classmethod
    def flatten_profile(cls, data: any) -> any:
        # Nếu data là dict, trả về ngay
        if isinstance(data, dict):
            return data

        # Nếu data là object (ORM), convert sang dict để Pydantic access field
        staff_dict = {}

        # 1. Map fields từ StaffProfile (nếu có)
        base_fields = ["user_id", "title", "bio", "color_code"]
        for field in base_fields:
            if hasattr(data, field):
                staff_dict[field] = getattr(data, field)

        # WHY: Trong môi trường Async, truy cập relationship chưa được load (lazy load)
        # sẽ gây lỗi MissingGreenlet. Ta dùng inspect để check trạng thái.
        from sqlalchemy import inspect
        inspections = inspect(data)

        # 2. Map fields từ UserProfile (relation 'profile')
        if inspections.mapper.relationships.get("profile") and "profile" in inspections.unloaded:
            # RELATION NOT LOADED - Trả về giá trị mặc định hoặc bỏ qua để tránh lỗi
            staff_dict["full_name"] = "Unknown Staff"
            staff_dict["is_active"] = False
        else:
            profile = getattr(data, "profile", None)
            if profile:
                staff_dict["full_name"] = getattr(profile, "full_name", None)
                staff_dict["is_active"] = getattr(profile, "is_active", False)
                staff_dict["avatar_url"] = getattr(profile, "avatar_url", None)
                staff_dict["role"] = getattr(profile, "role", None)
                staff_dict["email"] = getattr(profile, "email", None)

        # 3. Map Skills
        if inspections.mapper.relationships.get("skills") and "skills" in inspections.unloaded:
            staff_dict["skill_ids"] = []
        else:
            skills = getattr(data, "skills", [])
            staff_dict["skill_ids"] = [s.id for s in skills] if skills else []

        return staff_dict


class StaffProfileReadWithSkills(StaffProfileRead):
    """Schema trả về kèm danh sách skill IDs."""
    skill_ids: list[UUID] = []



class StaffSyncRequest(SQLModel):
    """
    Schema đồng bộ nhân viên sau khi đã invite thành công ở Frontend (Supabase).
    Backend chỉ nhận data và ghi vào DB, không gọi API ra ngoài.
    """
    user_id: UUID
    email: EmailStr
    full_name: str
    title: str = "Kỹ thuật viên"
    role: UserRole = UserRole.TECHNICIAN
    # bio, color_code có thể thêm sau nếu invite form có


class StaffSkillsUpdate(SQLModel):
    """Schema cập nhật danh sách kỹ năng cho nhân viên."""
    skill_ids: list[UUID]

