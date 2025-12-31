"""
Skill Router - API endpoints cho Skills.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_db
from app.modules.skills import service
from app.modules.skills.schemas import SkillCreate, SkillRead, SkillUpdate

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("", response_model=list[SkillRead])
async def list_skills(session: AsyncSession = Depends(get_db)):
    """Lấy danh sách tất cả skills."""
    return await service.get_all_skills(session)


@router.get("/{skill_id}", response_model=SkillRead)
async def get_skill(skill_id: UUID, session: AsyncSession = Depends(get_db)):
    """Lấy thông tin chi tiết một skill."""
    skill = await service.get_skill_by_id(session, skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill không tồn tại")
    return skill


@router.post("", response_model=SkillRead, status_code=status.HTTP_201_CREATED)
async def create_skill(data: SkillCreate, session: AsyncSession = Depends(get_db)):
    """Tạo skill mới."""
    return await service.create_skill(session, data)


@router.put("/{skill_id}", response_model=SkillRead)
async def update_skill(
    skill_id: UUID, data: SkillUpdate, session: AsyncSession = Depends(get_db)
):
    """Cập nhật thông tin skill (không được sửa code)."""
    return await service.update_skill(session, skill_id, data)


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(skill_id: UUID, session: AsyncSession = Depends(get_db)):
    """Xóa skill. Không thể xóa nếu đang được sử dụng."""
    await service.delete_skill(session, skill_id)
    return None
