class SystemService:
    """
    Lớp Service xử lý logic hệ thống.
    Tại đây có thể thực hiện check DB connection, Redis, etc.
    """
    async def check_health(self):
        # Giả lập check logic
        return {
            "status": "healthy",
            "database": "connected",
            "version": "0.1.0"
        }

system_service = SystemService()
