from datetime import date, datetime, timezone
from enum import Enum as PyEnum
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Column, Date, Text, Integer, ForeignKey, DateTime, Enum as SaEnum
from sqlmodel import Field, Relationship, SQLModel

# Avoid circular import if possible, but might need "StaffProfile" for type checking if using relationship
# from app.modules.staff.models import StaffProfile

# Note: inheriting from (str, PyEnum) is good for Pydantic v2
class MembershipTier(str, PyEnum):
    SILVER = "SILVER"
    GOLD = "GOLD"
    PLATINUM = "PLATINUM"
    DIAMOND = "DIAMOND"

class Gender(str, PyEnum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"

class Customer(SQLModel, table=True):
    __tablename__ = "customers"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    phone_number: str = Field(max_length=50, unique=True, index=True)
    full_name: str = Field(max_length=255)
    email: Optional[str] = Field(default=None, max_length=255)

    # Link to App User (Supabase Auth)
    # Note: ForeignKey to "auth.users.id" is removed for SQLite test compatibility.
    # In production with Postgres, this should be restored or handled via Alembic.
    user_id: Optional[UUID] = Field(default=None, nullable=True)

    membership_tier: MembershipTier = Field(default=MembershipTier.SILVER)

    # Personal Info
    gender: Optional[Gender] = Field(default=None)
    date_of_birth: Optional[date] = Field(default=None, sa_column=Column(Date, nullable=True))
    address: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))

    # Business/Medical Info
    allergies: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    medical_notes: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))

    # Preferences
    # Note: FK removed for SQLite testing isolation
    preferred_staff_id: Optional[UUID] = Field(default=None)

    # Timestamps
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False, onupdate=lambda: datetime.now(timezone.utc))
    )

    # Relationships (Defined later/here needed?)
    # preferred_staff: Optional["StaffProfile"] = Relationship()
