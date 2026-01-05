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
    1. Gọi Supabase Admin Invite API -> Tạo User + Gửi Email.
    2. Trigger DB tự tạo UserProfile.
    3. Tạo StaffProfile bổ sung.
    """
    try:
        # WHY: Supabase Trigger sẽ tự tạo UserProfile từ metadata này
        invite_data = {
            "email": invite_in.email,
            "data": {
                "full_name": invite_in.full_name,
                "role": invite_in.role
            }
        }

        # FIX: Dùng create_user để bypass lỗi 403 (Email Invite Blocked/SMTP issues)
        # Tạo user trực tiếp, không gửi email, auto-verify.
        # FIX: Dùng DIRECT HTTP REQUEST để mời nhân viên
        # Lý do: Thư viện supabase-py bị lỗi 403 (Forbidden) dù Key đúng.
        # Script debug_raw.py đã chứng minh direct request chạy ngon lành.
        # FIX: Dùng DIRECT REQUESTS (Sync) để mời nhân viên
        # Lý do: HTTPX có thể chưa được cài hoặc conflict trong môi trường venv hiện tại.
        # Requests là thư viện chuẩn nhất để đảm bảo call thành công.
        import requests
        from app.core.config import settings

        # Chuẩn bị URL và Header thủ công (bypass thư viện)
        auth_url = f"{settings.SUPABASE_URL}/auth/v1/invite"
        headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }
        # Payload chuẩn
        payload = {
            "email": invite_in.email,
            "data": invite_data["data"]
        }

        print(f"📡 Direct Invite via REQUESTS: {auth_url}")
        print(f"🔑 Key used: {settings.SUPABASE_SERVICE_ROLE_KEY[:10]}...")

        try:
            # Dùng requests.post (Sync) - Chấp nhận block xíu để đảm bảo chạy được
            resp = requests.post(auth_url, headers=headers, json=payload, timeout=10)

            if resp.status_code != 200:
                print(f"❌ Direct Invite Failed: {resp.status_code}")
                print(f"❌ Response Body: {resp.text}")
                # Ném lỗi để fallback/catch ở dưới xử lý
                raise Exception(f"Invite Failed: {resp.status_code} {resp.text}")

            # Parse response để lấy user object giả lập
            data_res = resp.json()
            # Cấu trúc trả về: User object trực tiếp
            class MockUser:
                def __init__(self, id):
                    self.id = id

            user = MockUser(id=data_res.get("id"))
            print(f"✅ Invite Success via REQUESTS! User ID: {user.id}")
        except Exception as http_err:
             print(f"❌ REQUESTS Exception: {str(http_err)}")
             raise http_err

        if not user or not user.id:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Supabase Invite/Create failed")

        user_id = UUID(user.id)

        # WHY: Tránh tạo trùng khi re-invite cùng email
        existing_staff = await get_staff_by_id(session, user_id)
        if existing_staff:
            existing_staff.title = invite_in.title
            session.add(existing_staff)
            await session.commit()
            await session.refresh(existing_staff)
            return existing_staff

        # FIX: Race Condition - Chờ Trigger tạo UserProfile xong mới tạo StaffProfile
        # Nếu insert ngay lập tức, có thể bị lỗi FK do bảng profiles chưa có record.
        for _ in range(10): # Thử 10 lần, mỗi lần 0.5s = tối đa 5s
            profile_exists = await session.get(UserProfile, user_id)
            if profile_exists:
                break
            await asyncio.sleep(0.5)
            # Refresh session to see new data
            # Note: session.get should fetch fresh if not in identity map, but trigger is external tx.
            # In asyncpg/sqlalchemy, changes from other tx are visible after commit if isolation level permits.
            # Here we just wait.

        # Fallback: Nếu trigger quá chậm hoặc lỗi, ta tự tạo Profile (dù có thể conflict nếu trigger chạy sau)
        # Nhưng thường trigger rất nhanh. Nếu sau 5s chưa có thì coi như lỗi Trigger.
        if not profile_exists:
            print(f"⚠️ Trigger quá chậm/lỗi. Fallback: Tự tạo Profile cho {user_id}")
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
            except Exception as e:
                print(f"⚠️ Fallback create profile failed (maybe trigger just finished): {e}")
                await session.rollback()

        staff_profile = StaffProfile(
            user_id=user_id,
            title=invite_in.title,
            bio="",
            color_code="#6366F1"
        )

        session.add(staff_profile)
        await session.commit()
        await session.refresh(staff_profile)

        return staff_profile

    except Exception as e:
        error_str = str(e)

        # DEBUG: Try to extract more details if available
        if hasattr(e, 'response') and e.response is not None:
            # For httpx/requests exceptions
            try:
                print(f"🔴 SUPABASE ERROR BODY: {e.response.text}")
                print(f"🔴 SUPABASE HEADERS: {e.response.headers}")
            except:
                pass
        if hasattr(e, 'message'):
            print(f"🔴 ERROR MESSAGE: {e.message}")

        # WHY: Supabase trả về message khác nhau cho duplicate email
        if "already been registered" in error_str or "already signed up" in error_str:
             # Nếu user đã có ở Supabase Auth nhưng chưa có trong StaffProfile (do lỗi trước đó)
             # Ta có thể support recovery ở đây, nhưng tạm thời báo lỗi conflict chuẩn
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email này đã được đăng ký hoặc mời tham gia hệ thống trước đó."
            )
        print(f"DEBUG - Invite Error: {error_str}")
        raise e


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
