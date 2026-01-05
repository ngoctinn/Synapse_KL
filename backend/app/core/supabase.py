from supabase import Client, create_client
from app.core.config import settings

def get_supabase_client() -> Client:
    """
    Khởi tạo Supabase Client với quyền Admin (Service Role).
    Dùng để thực hiện các tác vụ quản trị như Invite User, Delete User.
    CRITICAL: Không bao giờ expose client này ra Frontend vì nó có full quyền.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError("Thiếu cấu hình SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY")

    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

supabase_admin = get_supabase_client()
