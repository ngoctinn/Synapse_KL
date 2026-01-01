---
phase: planning
title: Staff Management & Scheduling - Task Breakdown
description: Chi tiết kế hoạch triển khai module nhân viên, phân ca và lịch làm việc
feature: staff-management
---

# Staff Management & Scheduling - Planning

## Milestones

- [ ] **M1**: Backend Foundation (Staff Profile, Shifts, Schedules, Invitations)
- [ ] **M2**: Frontend UI (Staff Management, Shift Management, Schedule Grid)
- [ ] **M3**: Integration, Testing & Validation

---

## Phase 1: Backend Foundation

### 1.1 Database Migration

- [ ] **1.1.1** Tạo file migration cho `shifts` table
- [ ] **1.1.2** Tạo file migration cho `staff_profiles` table (1-1 với `users`)
- [ ] **1.1.3** Tạo ENUM type `schedule_status` (DRAFT, PUBLISHED, CANCELLED)
- [ ] **1.1.4** Tạo file migration cho `staff_schedules` table
- [ ] **1.1.5** Tạo file migration cho `staff_skill_links` (link table M-N Staff-Skills)
- [ ] **1.1.6** Run migrations, verify với Supabase Studio

### 1.2 SQLModel Models

- [ ] **1.2.1** Tạo `app/modules/staff/models.py` - StaffProfile model
- [ ] **1.2.2** Tạo `app/modules/staff/link_models.py` - StaffSkillLink model (broken out if needed)
- [ ] **1.2.3** Tạo `app/modules/scheduling/models.py` - Shift, StaffSchedule models
- [ ] **1.2.4** Định nghĩa Relationships (Staff ↔ User, Staff ↔ Skills, Staff ↔ Schedule, Schedule ↔ Shift)
- [ ] **1.2.5** Test import tránh circular dependencies

---

## Phase 2: Backend APIs

### 2.1 Staff Profiles & Invitation Module

- [ ] **2.1.1** Tạo `schemas.py` - StaffProfileCreate, StaffProfileUpdate, StaffProfileRead
- [ ] **2.1.2** Tạo `service.py` - CRUD cho StaffProfile
- [ ] **2.1.3** Thực hiện `invite_staff` logic: Call Supabase Auth Admin API
- [ ] **2.1.4** Tạo `router.py` - Endpoints quản lý nhân viên và mời nhân viên mới
- [ ] **2.1.5** Test flow invitation (Mock/Real Supabase)

### 2.2 Shifts Module (Scheduling)

- [ ] **2.2.1** Tạo `schemas.py` - ShiftCreate, ShiftUpdate, ShiftRead
- [ ] **2.2.2** Tạo `service.py` - CRUD cho Shifts
- [ ] **2.2.3** Thêm validation: start_time < end_time
- [ ] **2.2.4** Tạo `router.py` - GET/POST/PUT/DELETE /shifts
- [ ] **2.2.5** Test endpoints

### 2.3 Staff Schedules Module

- [ ] **2.3.1** Tạo `schemas.py` - ScheduleCreate, ScheduleUpdate, ScheduleRead
- [ ] **2.3.2** Tạo `service.py` - CRUD + Batch create (phân lịch hàng loạt)
- [ ] **2.3.3** Logic check trùng lịch (Zero Overlap) cho nhân viên
- [ ] **2.3.4** Tạo `router.py` - GET/POST/PUT/DELETE /schedules
- [ ] **2.3.5** Test logic với dữ liệu ca làm việc mẫu

---

## Phase 3: Frontend Foundation

### 3.1 Types & Schemas

- [ ] **3.1.1** Tạo `features/staff/types.ts` - types cho Staff, Profile, Shift, Schedule
- [ ] **3.1.2** Tạo `features/staff/schemas.ts` - Zod schemas cho ProfileForm, ShiftForm, InvitationForm

### 3.2 Server Actions

- [ ] **3.2.1** Tạo `actions.ts` - Staff/Invitation actions
- [ ] **3.2.2** Tạo `actions.ts` - Shift actions
- [ ] **3.2.3** Tạo `actions.ts` - Scheduling actions

### 3.3 Page Setup

- [ ] **3.3.1** Tạo route `app/(dashboard)/(manager)/dashboard/manager/staff/page.tsx`
- [ ] **3.3.2** Tạo `loading.tsx` & skeleton components
- [ ] **3.3.3** Tạo main container `StaffManagement` với Tabs: "Nhân viên", "Ca làm việc", "Phân lịch"

---

## Phase 4: Frontend UI Components

### 4.1 Staff Tab

- [ ] **4.1.1** Tạo `staff-table.tsx` - Danh sách nhân viên (kèm Filter)
- [ ] **4.1.2** Tạo `invitation-form-sheet.tsx` - Form mời nhân viên mới
- [ ] **4.1.3** Tạo `staff-profile-form-sheet.tsx` - Form cập nhật hồ sơ & kỹ năng

### 4.2 Shifts Tab

- [ ] **4.2.1** Tạo `shift-list.tsx` - Quản lý danh sách các ca (Sáng, Chiều, Tối, ...)
- [ ] **4.2.2** Tạo `shift-form-sheet.tsx` - Thêm/Sửa ca làm việc với Color Picker

### 4.3 Scheduling Tab

- [ ] **4.3.1** Tạo `schedule-grid.tsx` - Giao diện Grid/Calendar để phân ca
- [ ] **4.3.2** Tạo `assign-shift-dialog.tsx` - Dialog chọn nhân viên & ca cho ngày cụ thể
- [ ] **4.3.3** Implement nút "Publish" để chuyển trạng thái từ DRAFT -> PUBLISHED

---

## Phase 5: Verification & Polish

### 5.1 Verification Flow
- [ ] **5.1.1** Test luồng mời nhân viên thực tế qua email (nếu config ổn)
- [ ] **5.1.2** E2E test cho việc tạo ca và gán ca cho nhân viên
- [ ] **5.1.3** Verify hiển thị màu sắc ca làm việc trên Grid

### 5.2 Polish
- [ ] **5.2.1** Thêm Toast notifications
- [ ] **5.2.2** Error handling cho trường hợp Email đã tồn tại trong Supabase
- [ ] **5.2.3** Optimistic updates cho việc gán ca

---

## Dependencies
- Backend core (Auth, DB)
- `app/modules/skills` (dùng để gán kỹ năng cho Staff)
- Supabase Admin SDK/API access cho việc invite

## Risks & Mitigation
- **Xung đột ca**: Cần logic check kỹ ở Backend.
- **Supabase Auth Integration**: Cần đảm bảo Role được sync đúng giữa Auth metadata và DB local.
