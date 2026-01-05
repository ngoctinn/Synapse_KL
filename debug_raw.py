
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv("backend/.env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

api_url = f"{url}/auth/v1/invite"
headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}
data = {
    "email": "debug_raw_invite@synapse-test.com"
}

print(f"📡 Sending Trace Request to: {api_url}")
print(f"🔑 Header Key (Partial): {key[:6]}...")

try:
    response = requests.post(api_url, headers=headers, json=data)

    print(f"\n⬇️ RESPONSE STATUS: {response.status_code}")
    print(f"⬇️ RESPONSE HEADERS: {json.dumps(dict(response.headers), indent=2)}")
    print(f"⬇️ RESPONSE BODY (RAW):")
    print(response.text)

except Exception as e:
    print(f"❌ Error: {e}")
