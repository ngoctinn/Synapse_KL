
import os
import sys
import time
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("backend/.env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"URL: {url}")
try:
    supabase = create_client(url, key)

    email = f"test_redirect_{int(time.time())}@synapse-test.com"
    print(f"Trying invite for {email} with explicit redirect_to...")

    # Thêm redirect_to xem có vượt qua 403 không
    response = supabase.auth.admin.invite_user_by_email(
        email,
        options={
            "redirect_to": "http://localhost:3000/auth/callback"
        }
    )

    print(f"✅ SUCCESS! User ID: {response.user.id}")

except Exception as e:
    print(f"❌ FAILED AGAIN: {str(e)}")
    if hasattr(e, 'response') and e.response:
        print(f"🔴 Body: {e.response.text}")
