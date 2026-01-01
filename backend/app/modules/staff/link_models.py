"""
Link Models for Staff module - Broken out to avoid circular imports.
"""
from uuid import UUID

from sqlmodel import Field, SQLModel


class StaffSkillLink(SQLModel, table=True):
    """
    Bảng liên kết M-N giữa StaffProfile và Skill.
    Nhân viên cần có tất cả Skills này để thực hiện dịch vụ tương ứng.
    """
    __tablename__ = "staff_skill_links"

    staff_id: UUID = Field(foreign_key="staff_profiles.user_id", primary_key=True)
    skill_id: UUID = Field(foreign_key="skills.id", primary_key=True)
