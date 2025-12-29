from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field

class BaseUUIDModel(SQLModel):
    """
    Model cơ sở sử dụng UUID làm Primary Key.
    """
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
