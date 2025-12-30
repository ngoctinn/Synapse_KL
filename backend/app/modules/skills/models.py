"""
Skill Model - Kỹ năng chuyên môn của nhân viên Spa.
Dùng để match dịch vụ với nhân viên có đủ năng lực thực hiện.
"""
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Skill(SQLModel, table=True):
    """
    Kỹ năng chuyên môn (VD: MASSAGE_THERAPY, FACIAL_TREATMENT).
    Mỗi dịch vụ yêu cầu một hoặc nhiều skills, nhân viên phải có TẤT CẢ skills đó.
    """
    __tablename__ = "skills"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(max_length=100)
    code: str = Field(max_length=50, unique=True, index=True)
    description: str | None = None

    # Relationship: Skill được nhiều Services yêu cầu (M-N qua link table)
    # Sẽ define sau khi có Service model để tránh circular import
