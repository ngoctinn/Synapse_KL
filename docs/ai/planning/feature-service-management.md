---
phase: planning
title: Service & Resource Management - Task Breakdown
description: Chi tiết từng task nhỏ nhất để implement module
feature: service-management
---

# Service & Resource Management - Planning

## Milestones

- [ ] **M1**: Backend APIs hoàn chỉnh (Skills, Categories, Resources, Services)
- [ ] **M2**: Frontend UI hoàn chỉnh (4 Tabs)
- [ ] **M3**: Integration & Testing

---

## Phase 1: Backend Foundation

### 1.1 Database Migration

- [ ] **1.1.1** Tạo file migration cho `skills` table
- [ ] **1.1.2** Tạo file migration cho `service_categories` table
- [ ] **1.1.3** Tạo ENUM types: `resource_type`, `resource_status`
- [ ] **1.1.4** Tạo file migration cho `resource_groups` table
- [ ] **1.1.5** Tạo file migration cho `resources` table
- [ ] **1.1.6** Tạo file migration cho `resource_maintenance_schedules` table
- [ ] **1.1.7** Tạo file migration cho `services` table
- [ ] **1.1.8** Tạo file migration cho `service_required_skills` (link table)
- [ ] **1.1.9** Tạo file migration cho `service_resource_requirements` (link table)
- [ ] **1.1.10** Run migrations, verify với Supabase Studio

### 1.2 SQLModel Models

- [ ] **1.2.1** Tạo `app/modules/skills/models.py` - Skill model
- [ ] **1.2.2** Tạo `app/modules/categories/models.py` - ServiceCategory model
- [ ] **1.2.3** Tạo `app/modules/resources/models.py` - ResourceGroup, Resource, MaintenanceSchedule models
- [ ] **1.2.4** Tạo `app/modules/services/models.py` - Service, ServiceSkillLink, ServiceResourceReq models
- [ ] **1.2.5** Định nghĩa Relationships giữa các models
- [ ] **1.2.6** Test import tất cả models không lỗi circular

---

## Phase 2: Backend APIs

### 2.1 Skills Module

- [ ] **2.1.1** Tạo `schemas.py` - SkillCreate, SkillUpdate, SkillRead
- [ ] **2.1.2** Tạo `service.py` - get_all, get_by_id, create, update, delete
- [ ] **2.1.3** Thêm validation: code UPPERCASE, unique check
- [ ] **2.1.4** Thêm check không xóa skill đang được dùng
- [ ] **2.1.5** Tạo `router.py` - GET/POST/PUT/DELETE endpoints
- [ ] **2.1.6** Test endpoints với Swagger UI

### 2.2 Categories Module

- [ ] **2.2.1** Tạo `schemas.py` - CategoryCreate, CategoryUpdate, CategoryRead
- [ ] **2.2.2** Tạo `service.py` - get_all (sorted), get_by_id, create, update, delete, reorder
- [ ] **2.2.3** Thêm check không xóa category đang có services
- [ ] **2.2.4** Tạo `router.py` - GET/POST/PUT/DELETE + PUT /reorder
- [ ] **2.2.5** Test endpoints

### 2.3 Resource Groups Module

- [ ] **2.3.1** Tạo `schemas.py` - GroupCreate, GroupUpdate, GroupRead
- [ ] **2.3.2** Tạo `service.py` - CRUD + soft delete
- [ ] **2.3.3** Thêm check không xóa group đang có resources hoặc được dịch vụ dùng
- [ ] **2.3.4** Tạo `router.py` - GET/POST/PUT/DELETE
- [ ] **2.3.5** Test endpoints

### 2.4 Resources Module

- [ ] **2.4.1** Tạo `schemas.py` - ResourceCreate, ResourceUpdate, ResourceRead, MaintenanceCreate
- [ ] **2.4.2** Tạo `service.py` - CRUD + soft delete + status update
- [ ] **2.4.3** Thêm maintenance_schedule CRUD
- [ ] **2.4.4** Tạo logic tự động set status=MAINTENANCE khi có schedule active
- [ ] **2.4.5** Tạo `router.py` - CRUD + POST/DELETE maintenance
- [ ] **2.4.6** Test endpoints

### 2.5 Services Module

- [ ] **2.5.1** Tạo `schemas.py` - ServiceCreate, ServiceUpdate, ServiceRead, ServiceDetail
- [ ] **2.5.2** Tạo `service.py` - get_all (với filters), get_by_id (với eager load)
- [ ] **2.5.3** Tạo `service.py` - create (với skills + resource_requirements)
- [ ] **2.5.4** Tạo `service.py` - update (sync skills + resource_requirements)
- [ ] **2.5.5** Tạo `service.py` - soft delete, toggle status
- [ ] **2.5.6** Tạo `router.py` - GET/POST/PUT/PATCH/DELETE
- [ ] **2.5.7** Test endpoints với full payload

### 2.6 Wire Up Routers

- [ ] **2.6.1** Register all routers trong `app/main.py`
- [ ] **2.6.2** Test tất cả endpoints hoạt động

---

## Phase 3: Frontend Foundation

### 3.1 Types & Schemas

- [ ] **3.1.1** Tạo `features/services/types.ts` - interfaces cho tất cả entities
- [ ] **3.1.2** Tạo `features/services/schemas.ts` - Zod schemas cho forms

### 3.2 Server Actions

- [ ] **3.2.1** Tạo `actions.ts` - Skills CRUD actions
- [ ] **3.2.2** Tạo `actions.ts` - Categories CRUD + reorder actions
- [ ] **3.2.3** Tạo `actions.ts` - Resource Groups CRUD actions
- [ ] **3.2.4** Tạo `actions.ts` - Resources CRUD + maintenance actions
- [ ] **3.2.5** Tạo `actions.ts` - Services CRUD + toggle status actions

### 3.3 Page Setup

- [ ] **3.3.1** Tạo `app/(dashboard)/(manager)/dashboard/manager/services/page.tsx`
- [ ] **3.3.2** Tạo `loading.tsx` với skeleton
- [ ] **3.3.3** Tạo `components/service-management.tsx` - main container với Tabs
- [ ] **3.3.4** Add route vào Sidebar

---

## Phase 4: Frontend UI - Tab by Tab

### 4.1 Skills Tab

- [ ] **4.1.1** Tạo `skills-tab/skills-table.tsx` - DataTable
- [ ] **4.1.2** Tạo `skills-tab/skill-form-dialog.tsx` - Add/Edit dialog
- [ ] **4.1.3** Wire up với Server Actions
- [ ] **4.1.4** Test CRUD flow

### 4.2 Categories Tab

- [ ] **4.2.1** Tạo `categories-tab/categories-list.tsx` - Sortable list
- [ ] **4.2.2** Tạo `categories-tab/category-form-dialog.tsx` - Add/Edit dialog
- [ ] **4.2.3** Implement drag-drop reorder
- [ ] **4.2.4** Wire up với Server Actions
- [ ] **4.2.5** Test CRUD + reorder flow

### 4.3 Resources Tab

- [ ] **4.3.1** Tạo `resources-tab/resources-grouped-list.tsx` - Grouped by ResourceGroup
- [ ] **4.3.2** Tạo `resources-tab/resource-group-form-dialog.tsx`
- [ ] **4.3.3** Tạo `resources-tab/resource-form-dialog.tsx`
- [ ] **4.3.4** Tạo `resources-tab/maintenance-dialog.tsx` - Schedule maintenance
- [ ] **4.3.5** Wire up với Server Actions
- [ ] **4.3.6** Test CRUD + maintenance flow

### 4.4 Services Tab

- [ ] **4.4.1** Tạo `services-tab/service-filters.tsx` - Search + Category + Status filters
- [ ] **4.4.2** Tạo `services-tab/services-table.tsx` - DataTable
- [ ] **4.4.3** Tạo `services-tab/service-form-sheet.tsx` - Full form Sheet
- [ ] **4.4.4** Implement Skills multi-select trong form
- [ ] **4.4.5** Implement Resource Requirements editor trong form
- [ ] **4.4.6** Implement inline status toggle
- [ ] **4.4.7** Wire up với Server Actions
- [ ] **4.4.8** Test full CRUD flow

---

## Phase 5: Polish & Testing

### 5.1 UX Polish

- [ ] **5.1.1** Thêm skeleton loading states cho mỗi tab
- [ ] **5.1.2** Thêm empty states khi không có data
- [ ] **5.1.3** Thêm toast notifications cho tất cả actions
- [ ] **5.1.4** Optimistic updates cho toggle status
- [ ] **5.1.5** Error handling graceful

### 5.2 Validation & Edge Cases

- [ ] **5.2.1** Test xóa Category đang có services -> hiện cảnh báo
- [ ] **5.2.2** Test xóa Skill đang được dùng -> hiện cảnh báo
- [ ] **5.2.3** Test xóa Resource Group đang được dùng -> hiện cảnh báo
- [ ] **5.2.4** Test duplicate skill code -> validation error
- [ ] **5.2.5** Test invalid durations -> validation error

### 5.3 Performance

- [ ] **5.3.1** Verify eager loading hoạt động (no N+1)
- [ ] **5.3.2** Test load 100+ services < 500ms
- [ ] **5.3.3** Verify tab switching instant

---

## Dependencies

```
Phase 1 (DB + Models)
    ↓
Phase 2 (APIs)
    ↓
Phase 3 (FE Foundation)
    ↓
Phase 4 (UI Components) - có thể làm song song theo Tab
    ↓
Phase 5 (Polish)
```

**External Dependencies:**
- Supabase project ready
- Backend core (db.py, config.py) đã setup

---

## Effort Estimates

| Phase | Tasks | Est. Time |
|-------|-------|-----------|
| 1. DB + Models | 16 tasks | 2-3h |
| 2. Backend APIs | 26 tasks | 4-5h |
| 3. FE Foundation | 9 tasks | 1-2h |
| 4. UI Components | 20 tasks | 5-6h |
| 5. Polish | 11 tasks | 2-3h |
| **Total** | **82 tasks** | **14-19h** |

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Relationship errors SQLModel | High | Tham khảo SQLMODEL_GUIDE.md |
| Async session issues | High | Luôn dùng expire_on_commit=False |
| M-N với extra columns phức tạp | Medium | Làm link table đơn giản trước |
| Drag-drop reorder khó | Medium | Dùng thư viện @dnd-kit |
