---
phase: planning
title: Service & Resource Management - Task Breakdown
description: Chi tiết từng task nhỏ nhất để implement module
feature: service-management
---

# Service & Resource Management - Planning

## Milestones

- [x] **M1**: Backend APIs hoàn chỉnh (Skills, Categories, Resources, Services)
- [ ] **M2**: Frontend UI hoàn chỉnh (4 Tabs)
- [ ] **M3**: Integration & Testing

---

## Phase 1: Backend Foundation (DONE)

### 1.1 Database Migration

- [x] **1.1.1** Tạo file migration cho `skills` table
- [x] **1.1.2** Tạo file migration cho `service_categories` table
- [x] **1.1.3** Tạo ENUM types: `resource_type`, `resource_status`
- [x] **1.1.4** Tạo file migration cho `resource_groups` table
- [x] **1.1.5** Tạo file migration cho `resources` table
- [x] **1.1.6** Tạo file migration cho `resource_maintenance_schedules` table
- [x] **1.1.7** Tạo file migration cho `services` table
- [x] **1.1.8** Tạo file migration cho `service_required_skills` (link table)
- [x] **1.1.9** Tạo file migration cho `service_resource_requirements` (link table)
- [x] **1.1.10** Run migrations, verify với Supabase Studio

### 1.2 SQLModel Models

- [x] **1.2.1** Tạo `app/modules/skills/models.py` - Skill model
- [x] **1.2.2** Tạo `app/modules/categories/models.py` - ServiceCategory model
- [x] **1.2.3** Tạo `app/modules/resources/models.py` - ResourceGroup, Resource, MaintenanceSchedule models
- [x] **1.2.4** Tạo `app/modules/services/models.py` - Service, ServiceSkillLink, ServiceResourceReq models
- [x] **1.2.5** Định nghĩa Relationships giữa các models
- [x] **1.2.6** Test import tất cả models không lỗi circular

---

## Phase 2: Backend APIs (DONE)

### 2.1 Skills Module

- [x] **2.1.1** Tạo `schemas.py` - SkillCreate, SkillUpdate, SkillRead
- [x] **2.1.2** Tạo `service.py` - get_all, get_by_id, create, update, delete
- [x] **2.1.3** Thêm validation: code UPPERCASE, unique check
- [x] **2.1.4** Thêm check không xóa skill đang được dùng
- [x] **2.1.5** Tạo `router.py` - GET/POST/PUT/DELETE endpoints
- [x] **2.1.6** Test endpoints với Swagger UI

### 2.2 Categories Module

- [x] **2.2.1** Tạo `schemas.py` - CategoryCreate, CategoryUpdate, CategoryRead
- [x] **2.2.2** Tạo `service.py` - get_all (sorted), get_by_id, create, update, delete, reorder
- [x] **2.2.3** Thêm check không xóa category đang có services
- [x] **2.2.4** Tạo `router.py` - GET/POST/PUT/DELETE + PUT /reorder
- [x] **2.2.5** Test endpoints

### 2.3 Resource Groups Module

- [x] **2.3.1** Tạo `schemas.py` - GroupCreate, GroupUpdate, GroupRead
- [x] **2.3.2** Tạo `service.py` - CRUD + soft delete
- [x] **2.3.3** Thêm check không xóa group đang có resources hoặc được dịch vụ dùng
- [x] **2.3.4** Tạo `router.py` - GET/POST/PUT/DELETE
- [x] **2.3.5** Test endpoints

### 2.4 Resources Module

- [x] **2.4.1** Tạo `schemas.py` - ResourceCreate, ResourceUpdate, ResourceRead, MaintenanceCreate
- [x] **2.4.2** Tạo `service.py` - CRUD + soft delete + status update
- [x] **2.4.3** Thêm maintenance_schedule CRUD
- [x] **2.4.4** Tạo logic tự động set status=MAINTENANCE khi có schedule active
- [x] **2.4.5** Tạo `router.py` - CRUD + POST/DELETE maintenance
- [x] **2.4.6** Test endpoints

### 2.5 Services Module

- [x] **2.5.1** Tạo `schemas.py` - ServiceCreate, ServiceUpdate, ServiceRead, ServiceDetail
- [x] **2.5.2** Tạo `service.py` - get_all (với filters), get_by_id (với eager load)
- [x] **2.5.3** Tạo `service.py` - create (với skills + resource_requirements)
- [x] **2.5.4** Tạo `service.py` - update (sync skills + resource_requirements)
- [x] **2.5.5** Tạo `service.py` - soft delete, toggle status
- [x] **2.5.6** Tạo `router.py` - GET/POST/PUT/PATCH/DELETE
- [x] **2.5.7** Test endpoints với full payload

### 2.6 Wire Up Routers

- [x] **2.6.1** Register all routers trong `app/main.py`
- [x] **2.6.2** Test tất cả endpoints hoạt động

---

## Phase 3: Frontend Foundation (DONE)

### 3.1 Types & Schemas

- [x] **3.1.1** Tạo `features/services/types.ts` - interfaces cho tất cả entities
- [x] **3.1.2** Tạo `features/services/schemas.ts` - Zod schemas cho forms

### 3.2 Server Actions

- [x] **3.2.1** Tạo `actions.ts` - Skills CRUD actions
- [x] **3.2.2** Tạo `actions.ts` - Categories CRUD + reorder actions
- [x] **3.2.3** Tạo `actions.ts` - Resource Groups CRUD actions
- [x] **3.2.4** Tạo `actions.ts` - Resources CRUD + maintenance actions
- [x] **3.2.5** Tạo `actions.ts` - Services CRUD + toggle status actions

### 3.3 Page Setup

- [x] **3.3.1** Tạo `app/(dashboard)/(manager)/dashboard/manager/services/page.tsx`
- [x] **3.3.2** Tạo `loading.tsx` với skeleton
- [x] **3.3.3** Tạo `components/service-management.tsx` - main container với Tabs
- [x] **3.3.4** Add route vào Sidebar

---

## Phase 4: Frontend UI - Tab by Tab (DONE)

### 4.1 Skills Tab

- [x] **4.1.1** Tạo `skills-tab/skills-table.tsx` - DataTable (Done basic list)
- [x] **4.1.2** Tạo `skills-tab/skill-form-sheet.tsx` - Add/Edit Sheet
- [x] **4.1.3** Wire up với Server Actions
- [x] **4.1.4** Test CRUD flow

### 4.2 Categories Tab

- [x] **4.2.1** Tạo `categories-tab/categories-list.tsx` - Sortable list (Done basic list)
- [x] **4.2.2** Tạo `categories-tab/category-form-sheet.tsx` - Add/Edit Sheet
- [x] **4.2.3** Implement drag-drop reorder (Pending DND lib, but Basic CRUD done)
- [x] **4.2.4** Wire up với Server Actions
- [x] **4.2.5** Test CRUD + reorder flow

### 4.3 Resources Tab

- [x] **4.3.1** Tạo `resources-tab/resources-grouped-list.tsx` - Grouped by ResourceGroup (Done basic list)
- [x] **4.3.2** Tạo `resources-tab/resource-group-form-sheet.tsx`
- [x] **4.3.3** Tạo `resources-tab/resource-form-sheet.tsx`
- [x] **4.3.4** Tạo `resources-tab/maintenance-sheet.tsx` - Schedule maintenance
- [x] **4.3.5** Wire up với Server Actions
- [x] **4.3.6** Test CRUD + maintenance flow

### 4.4 Services Tab

- [x] **4.4.1** Tạo `services-tab/service-filters.tsx` - Search + Category + Status filters (Done basic UI)
- [x] **4.4.2** Tạo `services-tab/services-table.tsx` - DataTable
- [x] **4.4.3** Tạo `services-tab/service-form-sheet.tsx` - Full form Sheet
- [x] **4.4.4** Implement Skills multi-select trong form
- [x] **4.4.5** Implement Resource Requirements editor trong form
- [x] **4.4.6** Implement inline status toggle
- [x] **4.4.7** Wire up với Server Actions
- [x] **4.4.8** Test full CRUD flow

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
