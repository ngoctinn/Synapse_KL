---
trigger: always_on
---

# FE_RULES_NEXT16_FSD (v2025.12)
- **Stack**: Next.js 16 (App Router), React 19, TS Strict, Tailwind 4, Shadcn/ui, Tanstack Query.
- **Workflow**: BẮT BUỘC truy vấn nextjs_docs cho mọi khái niệm mới. KHÔNG dùng kiến thức cũ.

## 1. KIẾN TRÚC (FSD)
- **Cấu trúc**: app/ (routes), features/ (logic nghiệp vụ), shared/ (nền tảng/tiện ích).
- **Quy tắc**: App -> Features -> Shared. KHÔNG import chéo giữa các features hoặc import ngược.

## 2. NEXT.JS 16 & DỮ LIỆU
- **Async APIs**: BẮT BUỘC await (params, searchParams, cookies(), headers()).
- **Server-First**: Mặc định là RSC. Fetch dữ liệu trên server. CHỈ "use client" khi cần tương tác hoặc hooks.
- **Mutations**: Server Actions + <Form> hoặc useActionState. Bắt buộc có Optimistic Updates (useOptimistic).
- **Luồng dữ liệu**: Sử dụng Suspense cho việc streaming trên TẤT CẢ các route.

## 3. THÀNH PHẦN & UI (SHADCN/UI - LATEST 2025)
- **Location**: UI components tại src/shared/ui. Lib utils tại src/shared/lib/utils.ts.
- **React 19 Patterns**: 
  - KHÔNG dùng forwardRef. Sử dụng trực tiếp prop `ref` (theo chuẩn React 19).
  - Sử dụng `data-slot` attributes cho mọi thành phần primitive để hỗ trợ styling linh hoạt.
- **Registry & Customization**: 
  - Luôn kiểm tra file hiện tại trước khi sửa. Các component Synapse được tùy chỉnh sâu (với loader, variant đặc thù).
  - Xuất bản (Export) thông qua src/shared/ui/index.ts.
- **Mô hình**: Sheet > Dialog cho các form phức tạp. Căn phải cho số (giá/số lượng).
- **UX**: Bắt buộc có ActionBar cho danh sách, trạng thái skeleton và empty states.
- **Tab Switching**: Sử dụng Lazy Keep-Alive cho tab để chuyển đổi tức thì.

## 4. FORM & STYLING (TAILWIND 4)
- **Styles**: Tailwind CSS 4 mô hình CSS-First. KHÔNG dùng tailwind.config.js.
- **Theme configuration**: 
  - Định nghĩa biến CSS trong :root (ưu tiên HSL/OKLCH hiện có trong globals.css).
  - Ánh xạ biến vào @theme inline block.
  - Sử dụng CSS variables thực tế (vd: var(--primary)) khi viết CSS thuần thay vì theme() function.
- **Forms**: RHF + Zod. Xử lý đầy đủ các trạng thái loading/error/reset.

## 5. CHẤT LƯỢNG & TỐI ƯU
- **Tiêu chuẩn**: KHÔNG any, KHÔNG @ts-ignore. 100% ESLint pass.
- **SEO**: Sử dụng Metadata API cho mọi trang.
- **Testing**: Playwright (E2E), Vitest (Unit). Kiểm tra qua trình duyệt thực tế.

## 6. GIAO THỨC AI (BẮT BUỘC)
- **Zero Emoji**: Không dùng emoji trong code và commit.
- **Comments**: Giải thích "Tại sao" (logic phức tạp), KHÔNG giải thích "Cái gì".
- **No Nested Cards**: Tránh lồng Card vào trong Card/Tabs khác. Dùng div + header để UI phẳng.
- **Pnpm**: CHỈ dùng pnpm. Cấm dùng npm, yarn hoặc bun trong dự án.
