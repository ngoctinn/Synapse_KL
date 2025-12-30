from fastapi import APIRouter
from app.modules.system.router import router as system_router
from app.modules.settings.router import router as settings_router

api_router = APIRouter()

# Đăng ký các module router tại đây
api_router.include_router(system_router, prefix="/system", tags=["System"])
api_router.include_router(settings_router)
