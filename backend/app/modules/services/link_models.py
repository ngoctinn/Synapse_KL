"""
Link Models for Services module - Broken out to avoid circular imports.
"""
from uuid import UUID
from sqlmodel import Field, SQLModel

class ServiceRequiredSkill(SQLModel, table=True):
    """
    Bảng liên kết M-N giữa Service và Skill.
    Dịch vụ yêu cầu nhân viên có TẤT CẢ skills trong bảng này (AND logic).
    """
    __tablename__ = "service_required_skills"

    service_id: UUID = Field(foreign_key="services.id", primary_key=True)
    skill_id: UUID = Field(foreign_key="skills.id", primary_key=True)
