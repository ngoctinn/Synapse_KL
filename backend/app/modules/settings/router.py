from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_db

from .schemas import OperationalSettingsRead, OperationalSettingsUpdate
from .service import settings_service

router = APIRouter(prefix="/settings/operational", tags=["Operational Settings"])

@router.get("/", response_model=OperationalSettingsRead)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    # Optional: user = Depends(get_current_user)
):
    """
    Get current operational settings (Operating Hours & Exception Dates).
    """
    return await settings_service.get_settings(db)

@router.put("/", response_model=OperationalSettingsRead)
async def update_settings(
    settings: OperationalSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    # TODO: Restore auth after frontend auth is implemented
    # user = Depends(get_current_user)
):
    """
    Update all operational settings (Transactional Replace).
    Only authenticated users (Managers) should access this.
    """
    return await settings_service.update_settings(db, settings)
