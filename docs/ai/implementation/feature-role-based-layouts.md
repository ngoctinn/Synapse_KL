---
phase: implementation
title: Implementation Guide - Role-Based Layouts
description: Ghi chú kỹ thuật về cấu trúc folder và logic hiển thị Slot.
---

# Implementation Guide: Role-Based Layouts

## Code Structure
Cấu trúc thư mục đề xuất:
```text
src/app/(dashboard)/
├── layout.tsx (DashboardLayout)
├── @manager/
│   ├── page.tsx
│   └── default.tsx
├── @receptionist/
│   ├── page.tsx
│   └── default.tsx
├── @technician/
│   ├── page.tsx
│   └── default.tsx
└── @customer/
    ├── page.tsx
    └── default.tsx
```

## Implementation Notes
- **Check Role Logic:** Sử dụng một hook `useUserRole()` trong Layout để quyết định slot nào được render nội dung, các slot khác render `null`.
- **Menu Config:** Tách biệt config menu ra file `shared/config/navigation.ts` để dễ quản lý.
