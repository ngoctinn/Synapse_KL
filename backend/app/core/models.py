"""
Central Model Registry - Import TẤT CẢ models theo đúng thứ tự để SQLAlchemy resolve relationships.

WHY: SQLAlchemy relationship với string reference (VD: `services: list["Service"]`) cần cả 2 classes
đã được load vào registry TRƯỚC KHI mapper configure. File này đảm bảo thứ tự import đúng.

USAGE: Import file này một lần trong main.py hoặc bất kỳ đâu cần đảm bảo models sẵn sàng.
"""

# 1. Link Models (không có relationships, chỉ Foreign Keys)
from app.modules.services.link_models import ServiceRequiredSkill  # noqa: F401
from app.modules.staff.link_models import StaffSkillLink  # noqa: F401

# 2. Base models không phụ thuộc models khác
from app.modules.categories.models import ServiceCategory  # noqa: F401
from app.modules.resources.models import ResourceGroup  # noqa: F401

# 3. Skill phụ thuộc link_models nhưng relationship string refs đến Service/StaffProfile
from app.modules.skills.models import Skill  # noqa: F401

# 4. Service phụ thuộc Category, ResourceGroup, Skill
from app.modules.services.models import Service, ServiceResourceRequirement  # noqa: F401

# 5. Staff/User Profiles
from app.modules.staff.models import UserProfile, StaffProfile  # noqa: F401

# 6. Scheduling phụ thuộc StaffProfile
from app.modules.scheduling.models import StaffSchedule  # noqa: F401
