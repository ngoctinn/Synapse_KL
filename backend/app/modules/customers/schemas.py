from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import EmailStr
from sqlmodel import SQLModel

from app.modules.customers.models import Gender, MembershipTier


# --- SHARED PROPERTIES ---
class CustomerBase(SQLModel):
    phone_number: str
    full_name: str
    email: Optional[EmailStr] = None
    gender: Optional[Gender] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    allergies: Optional[str] = None
    medical_notes: Optional[str] = None
    preferred_staff_id: Optional[UUID] = None
    # System fields managed by admin, not user
    loyalty_points: int = 0
    membership_tier: MembershipTier = MembershipTier.SILVER


# --- CREATION ---
class CustomerCreate(CustomerBase):
    pass


# --- UPDATE ---
class CustomerUpdate(SQLModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None  # Admin might need to fix phone number
    gender: Optional[Gender] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    allergies: Optional[str] = None
    medical_notes: Optional[str] = None
    preferred_staff_id: Optional[UUID] = None
    loyalty_points: Optional[int] = None
    membership_tier: Optional[MembershipTier] = None


# --- READ (RESPONSE) ---
class CustomerRead(CustomerBase):
    id: UUID
    user_id: Optional[UUID] = None  # To see if linked to App Account
