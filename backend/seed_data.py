
import asyncio
import os
import sys
from decimal import Decimal

# Add current dir to path
sys.path.append(os.getcwd())

from sqlalchemy import delete

from app.core.db import AsyncSessionLocal
from app.modules.categories.models import ServiceCategory
from app.modules.resources.models import Resource, ResourceGroup, ResourceType
from app.modules.services.link_models import ServiceRequiredSkill
from app.modules.services.models import Service, ServiceResourceRequirement
from app.modules.skills.models import Skill


async def seed_data():
    async with AsyncSessionLocal() as session:
        print("🌱 Starting Seed Process...")

        # 1. CLEANUP OLD DATA
        # Delete independent tables first if cascade not set, or dependent first.
        # Order: Service Links -> Services -> Resources -> Groups -> Skills -> Categories
        print("🗑️ Cleaning up old data...")
        await session.exec(delete(ServiceResourceRequirement))
        await session.exec(delete(ServiceRequiredSkill))
        await session.exec(delete(Service))
        await session.exec(delete(Resource))
        await session.exec(delete(ResourceGroup))
        await session.exec(delete(Skill))
        await session.exec(delete(ServiceCategory))
        await session.commit()

        # 2. CREATE CATEGORIES
        print("📂 Creating Categories...")
        cats = {
            "ACNE": ServiceCategory(name="Điều trị Mụn & Sẹo", description="Liệu trình chuyên sâu trị mụn và sẹo rỗ chuẩn y khoa", sort_order=1),
            "HITECH": ServiceCategory(name="Trẻ hóa & Công nghệ cao", description="Laser, Hifu, RF nâng cơ trẻ hóa", sort_order=2),
            "AESTHETICS": ServiceCategory(name="Thẩm mỹ Nội khoa", description="Tiêm Filler, Botox, Mesotherapy", sort_order=3),
            "RELAX": ServiceCategory(name="Spa & Thư giãn", description="Massage body, Gội đầu dưỡng sinh", sort_order=4),
        }
        for c in cats.values():
            session.add(c)
        await session.commit()
        # Refresh to get IDs
        for c in cats.values():
            await session.refresh(c)

        # 3. CREATE SKILLS
        print("🧠 Creating Skills...")
        skills = {
            "BASIC": Skill(name="KTV Chăm sóc", code="SKILL_BASIC", description="Facial cơ bản, Massage, Nặn mụn"),
            "TREATMENT": Skill(name="KTV Điều trị", code="SKILL_TREATMENT", description="Peel da, Triệt lông, Máy công nghệ cao"),
            "DOCTOR": Skill(name="Bác sĩ Da liễu", code="SKILL_DOCTOR", description="Khám da, Laser Co2, Tiêm Filler/Botox"),
            "CONSULT": Skill(name="Tư vấn viên", code="SKILL_CONSULT", description="Soi da, tư vấn phác đồ"),
        }
        for s in skills.values():
            session.add(s)
        await session.commit()
        for s in skills.values():
            await session.refresh(s)

        # 4. CREATE RESOURCE GROUPS & RESOURCES
        print("🏥 Creating Resources...")
        # Groups
        groups = {
            # Rooms/Beds Groups
            "CONSULT_ROOM": ResourceGroup(name="Phòng Tư vấn", type=ResourceType.ROOM, description="Phòng chức năng để tư vấn và soi da"),
            "TECH_BED": ResourceGroup(name="Giường Công nghệ cao", type=ResourceType.BED, description="Giường chuyên dụng trong phòng vô trùng"),
            "SPA_BED": ResourceGroup(name="Giường Spa", type=ResourceType.BED, description="Giường massage/facial tiêu chuẩn"),
            "LOBBY": ResourceGroup(name="Sảnh chờ", type=ResourceType.ROOM, description="Khu vực chung"),

            # Machine Groups (Equipment Pools)
            "MACHINE_SKIN_ANALYZER": ResourceGroup(name="Máy Soi da", type=ResourceType.EQUIPMENT, description="Thiết bị soi da Visia/A-One"),
            "MACHINE_LASER": ResourceGroup(name="Máy Laser", type=ResourceType.EQUIPMENT, description="Laser CO2, Nd:YAG"),
            "MACHINE_HIFU": ResourceGroup(name="Máy HIFU", type=ResourceType.EQUIPMENT, description="Máy nâng cơ công nghệ cao"),
            "MACHINE_IPL": ResourceGroup(name="Máy Triệt lông", type=ResourceType.EQUIPMENT, description="Diode Laser/IPL"),
            "MACHINE_ION": ResourceGroup(name="Máy Điện di", type=ResourceType.EQUIPMENT, description="Thiết bị điện di tinh chất"),
        }
        for g in groups.values():
            session.add(g)
        await session.commit()
        for g in groups.values():
            await session.refresh(g)

        # Resources
        resources = [
            # CONSULT AREA
            Resource(name="Phòng Tư vấn 01", code="ROOM-CS-01", group_id=groups["CONSULT_ROOM"].id),
            Resource(name="Máy Soi da Visia", code="EQ-VISIA-01", group_id=groups["MACHINE_SKIN_ANALYZER"].id),

            # TECH AREA (High-tech layout: 1 big room with 2 beds, or 2 separate rooms. Let's assume beds are the limit constraint)
            Resource(name="Giường Tech 01", code="BED-TECH-01", group_id=groups["TECH_BED"].id),
            Resource(name="Giường Tech 02", code="BED-TECH-02", group_id=groups["TECH_BED"].id),

            # Mobile Machines (Can move between beds)
            Resource(name="Máy Laser CO2 Fractional", code="EQ-LASER-01", group_id=groups["MACHINE_LASER"].id),
            Resource(name="Máy Triệt lông Diode", code="EQ-DIODE-01", group_id=groups["MACHINE_IPL"].id),
            Resource(name="Máy HIFU Ultraformer", code="EQ-HIFU-01", group_id=groups["MACHINE_HIFU"].id),

            # SPA AREA
            Resource(name="Giường Spa 01", code="BED-SPA-01", group_id=groups["SPA_BED"].id),
            Resource(name="Giường Spa 02", code="BED-SPA-02", group_id=groups["SPA_BED"].id),
            Resource(name="Giường Spa 03", code="BED-SPA-03", group_id=groups["SPA_BED"].id),
            Resource(name="Máy Điện di Ions", code="EQ-ION-01", group_id=groups["MACHINE_ION"].id),

            # LOBBY
            Resource(name="Ghế Massage Cao cấp", code="EQ-MASSAGE-01", group_id=groups["LOBBY"].id),
        ]
        for r in resources:
            session.add(r)
        await session.commit()

        # 5. CREATE SERVICES
        print("💆 Creating Services...")

        # Helper
        async def create_service(name, cat_key, price, duration, skill_key, desc, req_groups=None):
            srv = Service(
                name=name,
                category_id=cats[cat_key].id,
                price=Decimal(price),
                duration=duration,
                description=desc,
                is_active=True
            )
            session.add(srv)
            await session.commit()
            await session.refresh(srv)

            # Link Skill
            link = ServiceRequiredSkill(service_id=srv.id, skill_id=skills[skill_key].id)
            session.add(link)

            # Link Resource Req
            if req_groups:
                for grp_key, qty in req_groups.items():
                    req = ServiceResourceRequirement(
                        service_id=srv.id,
                        group_id=groups[grp_key].id,
                        quantity=qty,
                        usage_duration=duration
                    )
                    session.add(req)

            await session.commit()

        # Insert Services
        # 2.1. Acne & Scar
        # Lấy nhân mụn: Chỉ cần giường Spa
        await create_service("Lấy nhân mụn chuẩn Y khoa", "ACNE", 350000, 60, "BASIC", "Quy trình 12 bước, vô khuẩn", {"SPA_BED": 1})
        # Peel da: Chỉ cần giường Spa
        await create_service("Peel da sinh học trị mụn", "ACNE", 850000, 45, "TREATMENT", "Acid trái cây", {"SPA_BED": 1})
        # Phi kim: Cần Giường Tech + (Optional Machine, here assume auto-pen included in kit, but uses Tech Bed)
        await create_service("Phi kim trị sẹo rỗ", "ACNE", 2500000, 90, "TREATMENT", "Tái tạo bề mặt da", {"TECH_BED": 1})

        # 2.2. Hitech
        # Laser: Cần Giường Tech + Máy Laser
        await create_service("Laser Carbon trẻ hóa", "HITECH", 1200000, 60, "TREATMENT", "Se khít lỗ chân lông", {"TECH_BED": 1, "MACHINE_LASER": 1})
        # Điện di: Cần Giường Spa + Máy Điện di
        await create_service("Điện di tinh chất Vitamin C", "HITECH", 500000, 45, "BASIC", "Cấp ẩm, làm sáng da", {"SPA_BED": 1, "MACHINE_ION": 1})
        # HIFU: Cần Giường Tech + Máy HIFU
        await create_service("HIFU nâng cơ toàn mặt", "HITECH", 5000000, 90, "DOCTOR", "Nâng cơ không phẫu thuật", {"TECH_BED": 1, "MACHINE_HIFU": 1})

        # 2.3. Aesthetics
        # Tiêm: Cần Giường Tech (Vô trùng)
        await create_service("Tiêm Mesotherapy căng bóng", "AESTHETICS", 3500000, 45, "DOCTOR", "Cấy tinh chất Mulwang/HA", {"TECH_BED": 1})
        await create_service("Tiêm Filler cằm/mũi (1cc)", "AESTHETICS", 4500000, 30, "DOCTOR", "Tạo hình V-line", {"TECH_BED": 1})
        await create_service("Xóa nhăn Botox (vùng mắt/trán)", "AESTHETICS", 2500000, 30, "DOCTOR", "Xóa nhăn động", {"TECH_BED": 1})

        # 2.4. Relax
        # Gội đầu: Cần Giường Spa (có bồn gội) -> Assume SPA_BED handles this or separate SHAMPOO_BED. Let's use SPA_BED for simplicity or generic
        await create_service("Gội đầu dưỡng sinh", "RELAX", 150000, 45, "BASIC", "Gội thảo dược", {"SPA_BED": 1})
        await create_service("Massage Body đá nóng", "RELAX", 450000, 90, "BASIC", "Thư giãn cơ", {"SPA_BED": 1})

        print("✅ Seed Data Completed Successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
