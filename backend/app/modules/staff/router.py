"""
Staff Router - API Endpoints cho quản lý nhân viên.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status, HTTPException
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import create_client, Client as SupabaseClient

from app.core.config import settings
from app.core.db import get_db
from app.modules.staff import service
from app.modules.staff.schemas import (
    StaffProfileCreate,
    StaffProfileRead,
    StaffProfileReadWithSkills,
    StaffProfileUpdate,
    StaffSkillsUpdate,
    StaffInviteRequest,
)

router = APIRouter(prefix="/staff", tags=["Staff"])


def get_supabase_admin() -> SupabaseClient:
    """Supabase client với service_role key (có admin privileges)"""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Thiếu cấu hình Supabase (SUPABASE_URL hoặc SERVICE_ROLE_KEY)"
        )
    return create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY
    )


@router.post("/invite", status_code=status.HTTP_201_CREATED)
async def invite_staff(
    data: StaffInviteRequest,
    supabase: SupabaseClient = Depends(get_supabase_admin)
):
    """
    Mời nhân viên mới qua email.
    Sử dụng Supabase Admin API để gửi invite link.
    """
    try:
        # Supabase Python SDK: auth.admin.invite_user_by_email
        response = supabase.auth.admin.invite_user_by_email(
            email=data.email,
            options={
                "data": {
                    "full_name": data.full_name,
                    "role": data.role,
                    "title": data.title
                },
                "redirect_to": f"{settings.FRONTEND_URL}/auth/update-password"
            }
        )

        # Check success
        if hasattr(response, 'user') and response.user:
            return {
                "success": True,
                "message": f"Đã gửi thư mời đến {data.email}",
                "user_id": str(response.user.id)
            }

        return {"success": True, "message": "Yêu cầu mời đã được gửi thành công"}

    except Exception as e:
        error_str = str(e)
        detail = "Lỗi không xác định khi mời nhân viên"

        if "already registered" in error_str.lower():
            detail = "Email này đã được đăng ký hoặc mời trước đó"
        elif "rate limit" in error_str.lower():
            detail = "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau"
        elif "smtp" in error_str.lower():
            detail = "Lỗi kết nối máy chủ email (SMTP). Vui lòng kiểm tra lại cấu hình"
        else:
            detail = f"Lỗi: {error_str}"

        print(f"DEBUG - Supabase Invite Error: {error_str}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


@router.get("/", response_model=list[StaffProfileReadWithSkills])
async def list_staff(
    session: AsyncSession = Depends(get_db),
):
    """Lấy danh sách tất cả nhân viên."""
    staff_list = await service.get_all_staff(session)
    result = []
    for staff in staff_list:
        # Manual mapping for flattened response
        staff_data = StaffProfileReadWithSkills(
            user_id=staff.user_id,
            full_name=staff.profile.full_name if staff.profile else "Không xác định",
            title=staff.title,
            bio=staff.bio,
            color_code=staff.color_code,
            is_active=staff.profile.is_active if staff.profile else False,
            skill_ids=[skill.id for skill in staff.skills]
        )
        result.append(staff_data)
    return result


@router.get("/{user_id}", response_model=StaffProfileReadWithSkills)
async def get_staff(
    user_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    """Lấy thông tin chi tiết một nhân viên."""
    staff = await service.get_staff_by_id(session, user_id)
    if not staff:
        from app.modules.staff.exceptions import StaffNotFoundException
        raise StaffNotFoundException()

    # Manual mapping
    result = StaffProfileReadWithSkills(
        user_id=staff.user_id,
        full_name=staff.profile.full_name if staff.profile else "Không xác định",
        title=staff.title,
        bio=staff.bio,
        color_code=staff.color_code,
        is_active=staff.profile.is_active if staff.profile else False,
        skill_ids=[skill.id for skill in staff.skills]
    )
    return result


@router.post("/", response_model=StaffProfileRead, status_code=status.HTTP_201_CREATED)
async def create_staff(
    staff_in: StaffProfileCreate,
    session: AsyncSession = Depends(get_db),
):
    """Tạo hồ sơ nhân viên mới."""
    staff = await service.create_staff_profile(session, staff_in)
    return staff


@router.put("/{user_id}", response_model=StaffProfileRead)
async def update_staff(
    user_id: UUID,
    staff_in: StaffProfileUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Cập nhật thông tin nhân viên."""
    staff = await service.update_staff_profile(session, user_id, staff_in)

    return StaffProfileRead(
        user_id=staff.user_id,
        full_name=staff.profile.full_name if staff.profile else "Không xác định",
        title=staff.title,
        bio=staff.bio,
        color_code=staff.color_code,
        is_active=staff.profile.is_active if staff.profile else False,
    )


@router.put("/{user_id}/skills", response_model=StaffProfileReadWithSkills)
async def update_staff_skills(
    user_id: UUID,
    skills_in: StaffSkillsUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Cập nhật danh sách kỹ năng cho nhân viên."""
    staff = await service.update_staff_skills(session, user_id, skills_in)

    return StaffProfileReadWithSkills(
        user_id=staff.user_id,
        full_name=staff.profile.full_name if staff.profile else "Không xác định",
        title=staff.title,
        bio=staff.bio,
        color_code=staff.color_code,
        is_active=staff.profile.is_active if staff.profile else False,
        skill_ids=[skill.id for skill in staff.skills]
    )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_staff(
    user_id: UUID,
    session: AsyncSession = Depends(get_db),
):
    """Xóa (vô hiệu hóa) nhân viên."""
    await service.delete_staff_profile(session, user_id)
    return None
