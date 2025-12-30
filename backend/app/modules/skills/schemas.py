"""
Skill Schemas - DTOs cho request/response của Skills API.
"""
import re
from uuid import UUID

from pydantic import ConfigDict, model_validator
from sqlmodel import SQLModel
from typing_extensions import Self


class SkillCreate(SQLModel):
    """Schema tạo mới Skill."""
    name: str
    code: str | None = None
    description: str | None = None

    @model_validator(mode="after")
    def generate_and_validate_code(self) -> Self:
        """Tự động sinh code từ name nếu không nhập, validate format."""
        if not self.code:
            self.code = self.name.upper().replace(" ", "_").replace("-", "_")
        else:
            self.code = self.code.upper().replace(" ", "_").replace("-", "_")

        if not re.match(r"^[A-Z][A-Z0-9_]*$", self.code):
            raise ValueError("Code phải bắt đầu bằng chữ cái và chỉ chứa A-Z, 0-9, _")
        return self


class SkillUpdate(SQLModel):
    """Schema cập nhật Skill. Code không được sửa."""
    name: str | None = None
    description: str | None = None


class SkillRead(SQLModel):
    """Schema trả về cho client."""
    id: UUID
    name: str
    code: str
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)


class SkillReadWithCounts(SkillRead):
    """Schema trả về kèm số lượng services và staff sử dụng skill."""
    service_count: int = 0
    staff_count: int = 0
