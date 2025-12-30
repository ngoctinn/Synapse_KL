from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from app.core.config import settings

security = HTTPBearer()

class TokenPayload(BaseModel):
    """JWT payload structure from Supabase"""
    sub: str
    email: Optional[str] = None
    role: str = "authenticated"
    aud: str = "authenticated"
    # Allow extra fields for app_metadata if needed

class CurrentUser(BaseModel):
    id: UUID
    email: Optional[str] = None
    role: str

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> CurrentUser:
    """Validate Supabase JWT and return user"""
    token = credentials.credentials

    try:
        # Decode JWT
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            audience="authenticated"
        )

        token_data = TokenPayload(**payload)

        return CurrentUser(
            id=UUID(token_data.sub),
            email=token_data.email,
            role=token_data.role
        )

    except (JWTError, ValueError) as e:
        # ValueError can happen if UUID is invalid
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Placeholder for Role Based Access Control
# For MVP, we check if user is authenticated.
# In future, we decode 'app_metadata' from JWT for specific roles (manager, technician)
def require_manager(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    # Logic to verify manager role would go here
    # if current_user.role != "manager": raise HTTPException(403)
    return current_user
