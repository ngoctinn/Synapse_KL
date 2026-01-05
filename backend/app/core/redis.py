"""
Redis/Upstash Connection - Quản lý kết nối Redis cho ARQ background jobs.

Cú pháp dựa trên ARQ docs: https://arq-docs.helpmanual.io/
"""
from arq.connections import RedisSettings

from app.core.config import settings


def get_redis_settings() -> RedisSettings:
    """
    Lấy cấu hình Redis từ Upstash URL.
    Format URL: rediss://default:password@hostname:port

    WHY: Upstash dùng rediss:// (SSL) thay vì redis://
    """
    url = settings.UPSTASH_REDIS_URL

    if not url:
        raise ValueError(
            "UPSTASH_REDIS_URL chưa được cấu hình. "
            "Vui lòng thêm vào file .env"
        )

    # Parse URL format của Upstash: rediss://default:password@hostname:port
    use_ssl = url.startswith("rediss://")

    if url.startswith("redis://"):
        url = url[8:]
    elif url.startswith("rediss://"):
        url = url[9:]

    # Split auth and host
    if "@" in url:
        auth, host_part = url.rsplit("@", 1)
        if ":" in auth:
            _, password = auth.split(":", 1)
        else:
            password = auth
    else:
        password = None
        host_part = url

    # Split host and port
    if ":" in host_part:
        host, port_str = host_part.rsplit(":", 1)
        port = int(port_str)
    else:
        host = host_part
        port = 6379

    return RedisSettings(
        host=host,
        port=port,
        password=password,
        ssl=use_ssl,
    )


# WHY: Export settings cho ARQ CLI có thể import trực tiếp
REDIS_SETTINGS = None

def get_or_create_redis_settings() -> RedisSettings:
    """Lazy initialization để tránh lỗi khi import ở startup."""
    global REDIS_SETTINGS
    if REDIS_SETTINGS is None:
        REDIS_SETTINGS = get_redis_settings()
    return REDIS_SETTINGS
