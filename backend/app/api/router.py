from fastapi import APIRouter
from app.modules.system.router import router as system_router
from app.modules.settings.router import router as settings_router
from app.modules.skills.router import router as skills_router
from app.modules.categories.router import router as categories_router
from app.modules.resources.router import router as resources_router
from app.modules.services.router import router as services_router

api_router = APIRouter()

# Đăng ký các module router
api_router.include_router(system_router, prefix="/system", tags=["System"])
api_router.include_router(settings_router)
api_router.include_router(skills_router)
api_router.include_router(categories_router)
api_router.include_router(resources_router)
api_router.include_router(services_router)
