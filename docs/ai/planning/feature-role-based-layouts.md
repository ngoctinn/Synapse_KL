---
phase: planning
title: Project Planning & Task Breakdown - Role-Based Layouts
description: Lộ trình triển khai hệ thống đa layout từ khung xương đến tích hợp chi tiết.
---

# Project Planning & Task Breakdown: Role-Based Layouts

## Milestones
- [ ] Milestone 1: Tái cấu trúc Route Groups và di chuyển logic Page.
- [ ] Milestone 2: Triển khai Shared Navigation Config và Sidebar thông minh.
- [ ] Milestone 3: Hoàn thiện middleware redirections và Role Guard.

## Task Breakdown

### Phase 1: Foundation (Cấu trúc & Routing)
- [ ] **Task 1.1:** Tạo cấu trúc Route Groups: `(manager)`, `(receptionist)`, `(technician)`, `(customer)`.
- [ ] **Task 1.2:** Di chuyển các folder page hiện tại vào đúng Route Group tương ứng.
- [ ] **Task 1.3:** Thiết lập trang Dispatcher tại `/dashboard/page.tsx` để thực hiện redirect dựa trên role từ Server-side.

### Phase 2: Core Components (UI tập trung)
- [ ] **Task 2.1:** Khởi tạo `src/shared/config/navigation.ts` để định nghĩa menu cho 4 role.
- [ ] **Task 2.2:** Cập nhật `AppSidebar` để đọc config từ `navigation.ts` dựa trên role của user hiện tại.
- [ ] **Task 2.3:** Xây dựng Dashboard Landing Page tối giản (metrics/widgets) cho từng role.

### Phase 3: Security & Polish (Bảo mật & Tối ưu)
- [ ] **Task 3.1:** Cập nhật Middleware để xử lý redirect thông minh (ví dụ: user role Customer truy cập `/manager/*` bị chặn).
- [ ] **Task 3.2:** Triển khai `RoleGuard` component để bảo vệ các Server Actions nhạy cảm.
- [ ] **Task 3.3:** Kiểm tra SEO, Accessibility (WCAG 2.1) cho toàn bộ hệ thống navigation mới.

## Timeline & Estimates
- **Phase 1:** 3 giờ (Cấu trúc lại thư mục).
- **Phase 2:** 5 giờ (UI & Logic menu).
- **Phase 3:** 4 giờ (Bảo mật & Testing).

## Risks & Mitigation
- **Rủi ro:** Redirect vòng lặp (Redirect loop) nếu cấu hình middleware và dispatcher không khớp.
- **Giải pháp:** Sử dụng hằng số URL (`ROUTES.DASHBOARD`, `ROUTES.LOGIN`) tập trung và viết unit test cho logic redirect.
