"""
Staff Service - Business logic cho quản lý nhân viên.
"""
from typing import Sequence
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.supabase import supabase_admin
from app.modules.staff.exceptions import StaffNotFoundException
import asyncio
from app.modules.staff.link_models import StaffSkillLink
from app.modules.staff.models import StaffProfile, UserProfile
from app.modules.staff.schemas import (
    StaffInviteRequest,
    StaffProfileCreate,
    StaffProfileUpdate,
    StaffSkillsUpdate,
)
import requests
from starlette.concurrency import run_in_threadpool




async def get_all_staff(session: AsyncSession) -> Sequence[StaffProfile]:
    """Lấy danh sách tất cả nhân viên."""
    result = await session.execute(
        select(StaffProfile).options(
            selectinload(StaffProfile.skills),
            selectinload(StaffProfile.profile)
        )
    )
    return result.scalars().all()


async def get_staff_by_id(session: AsyncSession, user_id: UUID) -> StaffProfile | None:
    """Lấy thông tin chi tiết một nhân viên."""
    result = await session.execute(
        select(StaffProfile)
        .options(
            selectinload(StaffProfile.skills),
            selectinload(StaffProfile.profile)
        )
        .where(StaffProfile.user_id == user_id)
    )
    return result.scalars().first()


async def invite_staff(session: AsyncSession, invite_in: StaffInviteRequest) -> StaffProfile:
    """
    Mời nhân viên mới:
    1. Check Local DB: Nếu User đã tồn tại -> Kích hoạt lại (Không gửi mail).
    2. Nếu chưa có -> Gọi Supabase Admin Invite API -> Tạo User + Gửi Email.
    """
    # B1: Check Local Data trước để tránh spam mail invite cho nhân viên cũ
    existing_profile = (await session.execute(
        select(UserProfile).where(UserProfile.email == invite_in.email)
    )).scalars().first()

    user_id: UUID

    if existing_profile:
        # CASE 1: Đã có hồ sơ -> Kích hoạt lại
        logger.info(f"♻️ User {invite_in.email} already exists locally. Reactivating instantly.")
        user_id = existing_profile.id

        # Đảm bảo active luôn tại đây
        existing_profile.is_active = True
        existing_profile.role = invite_in.role
        session.add(existing_profile)
    else:
        # CASE 2: Chưa có -> Mời mới qua Supabase
        try:
            invite_data = {
                "email": invite_in.email,
                "data": {
                    "full_name": invite_in.full_name,
                    "role": invite_in.role
                }
            }

            auth_url = f"{settings.SUPABASE_URL}/auth/v1/invite"
            headers = {
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "email": invite_in.email,
                "data": invite_data["data"]
            }

            logger.info(f"📡 Direct Invite via Requests: {auth_url}")

            # FIX: Use requests + run_in_threadpool to avoid Windows asyncio hangs while keeping non-blocking behavior
            # FIX: Use requests + run_in_threadpool with partial to handle kwargs correctly
            from functools import partial
            post_cmd = partial(requests.post, auth_url, headers=headers, json=payload)
            resp = await run_in_threadpool(post_cmd)

            # Xử lý trường hợp Exception từ Supabase
            if resp.status_code != 200:
                error_data = resp.json()
                error_msg = error_data.get("msg", "") or error_data.get("message", "")

                # Fallback: Nếu Supabase bảo đã tồn tại (mà Local DB lại không thấy - Data lệch)
                if "already been registered" in error_msg or "already signed up" in error_msg:
                    logger.warning(f"⚠️ User {invite_in.email} exists in Auth but MISSING in Local DB.")
                    # Trường hợp này buộc phải báo lỗi để Admin check lại data sync
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Email này đã đăng ký tài khoản nhưng thiếu hồ sơ hệ thống. Vui lòng liên hệ Admin."
                    )
                else:
                    logger.error(f"❌ Direct Invite Failed: {resp.status_code} - {resp.text}")
                    raise Exception(f"Invite Failed: {resp.status_code} {error_msg}")

            # Invite thành công
            data_res = resp.json()
            user_id = UUID(data_res.get("id"))
            logger.info(f"✅ Invite Success! New User ID: {user_id}")

        except Exception as e:
            error_str = str(e)
            logger.error(f"DEBUG - Invite Logic Error: {error_str}")
            raise e

    # --- LOGIC CHUNG SAU KHI CÓ USER_ID ---

    # Chỉ wait trigger nếu là User Mới (tức là không phải existing_profile)
    if not existing_profile:
        # Wait for Supabase Trigger to create UserProfile
        profile_exists = await session.get(UserProfile, user_id)
        if not profile_exists:
            for _ in range(10): # Wait up to 5s
                profile_exists = await session.get(UserProfile, user_id)
                if profile_exists:
                    break
                await asyncio.sleep(0.5)

        if not profile_exists:
            logger.warning(f"⚠️ Trigger slow. Fallback creating profile for {user_id}")
            new_profile = UserProfile(
                id=user_id,
                email=invite_in.email,
                full_name=invite_in.full_name,
                role=invite_in.role,
                is_active=True
            )
            session.add(new_profile)
            try:
                await session.flush()
            except Exception:
                await session.rollback()

    # 2. Xử lý StaffProfile
        staff_profile = await session.get(StaffProfile, user_id)

        if staff_profile:
            # Nếu đã là nhân viên -> Cập nhật thông tin mới nhất
            staff_profile.title = invite_in.title
            session.add(staff_profile) # Mark for update
            logger.info(f"♻️ Updating existing Staff Profile: {user_id}")
        else:
            # Nếu chưa là nhân viên -> Tạo mới
            staff_profile = StaffProfile(
                user_id=user_id,
                title=invite_in.title,
                bio="",
                color_code="#6366F1"
            )
            session.add(staff_profile)
            logger.info(f"✨ Creating NEW Staff Profile: {user_id}")

        # 3. Đảm bảo UserProfile Active (trường hợp nhân viên cũ nghỉ việc quay lại)
        user_profile = await session.get(UserProfile, user_id)
        if user_profile:
             user_profile.is_active = True
             user_profile.role = invite_in.role # Cập nhật role mới luôn
             session.add(user_profile)

        await session.commit()
        await session.refresh(staff_profile)
        # Refresh relation để api trả về full data - QUAN TRỌNG
        try:
            await session.refresh(staff_profile, ["profile"])
        except Exception:
            # Fallback nếu refresh relation fail (hiếm)
            pass

        return staff_profile





async def create_staff_profile(
    session: AsyncSession, staff_in: StaffProfileCreate
) -> StaffProfile:
    """Tạo hồ sơ nhân viên mới sau khi được invite qua Supabase Auth."""
    staff = StaffProfile.model_validate(staff_in)
    session.add(staff)
    await session.commit()
    await session.refresh(staff)
    return staff


async def update_staff_profile(
    session: AsyncSession, user_id: UUID, staff_in: StaffProfileUpdate
) -> StaffProfile:
    """Cập nhật thông tin nhân viên."""
    staff = await get_staff_by_id(session, user_id)
    if not staff:
        raise StaffNotFoundException()

    # WHY: Tách riêng để update đúng bảng (profiles vs staff_profiles)
    update_data = staff_in.model_dump(exclude_unset=True)

    profile_fields = {"full_name", "is_active", "avatar_url"}
    profile_update = {k: v for k, v in update_data.items() if k in profile_fields}

    if profile_update and staff.profile:
        for key, value in profile_update.items():
            setattr(staff.profile, key, value)
        session.add(staff.profile)

    staff_fields = {"title", "bio", "color_code"}
    staff_update = {k: v for k, v in update_data.items() if k in staff_fields}

    for key, value in staff_update.items():
        setattr(staff, key, value)

    session.add(staff)
    await session.commit()
    await session.refresh(staff)
    await session.refresh(staff.profile)
    return staff


async def update_staff_skills(
    session: AsyncSession, user_id: UUID, skills_in: StaffSkillsUpdate
) -> StaffProfile:
    """Cập nhật danh sách kỹ năng cho nhân viên (sync toàn bộ)."""
    staff = await get_staff_by_id(session, user_id)
    if not staff:
        raise StaffNotFoundException()

    # WHY: Sync toàn bộ - xóa cũ, tạo mới để đảm bảo consistency
    existing_links = (await session.execute(
        select(StaffSkillLink).where(StaffSkillLink.staff_id == user_id)
    )).scalars().all()
    for link in existing_links:
        await session.delete(link)

    for skill_id in skills_in.skill_ids:
        new_link = StaffSkillLink(staff_id=user_id, skill_id=skill_id)
        session.add(new_link)

    await session.commit()
    await session.refresh(staff)
    return staff


async def delete_staff_profile(session: AsyncSession, user_id: UUID) -> bool:
    """Xóa hồ sơ nhân viên (soft delete bằng is_active=False trong profiles)."""
    staff = await get_staff_by_id(session, user_id)
    if not staff:
        raise StaffNotFoundException()

    # WHY: Soft delete thay vì hard delete để giữ history booking
    if staff.profile:
        staff.profile.is_active = False
        session.add(staff.profile)

    await session.commit()
    return True
