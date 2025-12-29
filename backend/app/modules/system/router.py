from fastapi import APIRouter
from app.modules.system.service import system_service

router = APIRouter()

@router.get("/health")
async def health_check():
    """ Đệ trình yêu cầu kiểm tra sức khỏe hệ thống qua lớp Service. """
    return await system_service.check_health()
