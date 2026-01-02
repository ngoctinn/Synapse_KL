<!-- AGENT_NOTE: Concise reusable patterns. Grouped by logic. Keep critical code blocks. -->
# FRONTEND_CHEATSHEET (NEXT.js 16)

## 0. FILTERING STRATEGY (SYNAPSE SPECIFIC)
- **High Vol (Booking/Schedule)**: Mandatory **Backend Filtering** + URL Params (searchParams). Requires Real-time sync.
- **Low Vol (Settings/Skills)**: Use **Frontend Filtering** if items < 200 for instant UX (Zero-latency).

## 1. PERFORMANCE & HYDRATION
- **Async Pattern**: Use standard `Async Page` + `loading.tsx`. Avoid manual fetch/suspense to prevent blocking.
- **Dynamic Content**: Use `next/dynamic(ssr:false)` for heavy Tabs to show local Skeleton.
- **Hydration**: Add `suppressHydrationWarning` to `<body>` for Inter/Roboto variable fonts.
- **Deep Compare**: Avoid `JSON.stringify` in `useEffect` deps. Use shallow compare or `useRef` guard to prevent infinite loops (especially in 2-way sync).

## 2. TABS & INSTANT SWITCHING
- **Preserve DOM**: Use `forceMount={true}` on `TabsContent` + CSS `data-[state=inactive]:hidden` to prevent heavy remounts.
- **Initial Load**: Static import default tab; dynamic import others only.

## 3. FORMS & STATE (isDirty)
- **Dirty Reset**: Always sync `setOriginalSettings(data)` AND `setSettings(data)` after save to reset `isDirty` flag correctly.
- **Response**: Standardize `update` action response to match `get` structure (Normalization).
- **Navigation**: Use `onInvalid` in `form.handleSubmit` to auto-switch tabs to the first error field.
- **Draft Ops**: Simple client-side add/delete are "Drafts" - omit Alert Dialogs. Use Batch Save (1 PUT request).

## 4. ADVANCED UI/UX (2025)
- **A11y/DND**: Use `useId()` for `DndContext` to sync IDs between SSR/Client.
- **Dirty Guard**: For Sheets/Dialogs, intercept `onPointerDownOutside`/`onEscapeKeyDown` + `e.preventDefault()` if `isDirty`. Use `AlertDialog` to confirm exit.
- **Visuals**: `form.watch` for real-time Micro-Gantt/Timeline. `Intl.NumberFormat` for VND masking. `ghost` variant for Cancel buttons.

## 5. DATA FORMAT (FE <-> BE)
- **Dates**: Python needs `YYYY-MM-DD` (Date object).
- **Time**: BE returns `HH:mm:ss`, FE must `.slice(0,5)` to get `HH:mm`.
- **IDs**: If BE lacks IDs, gen via `crypto.randomUUID()`.

## 6. UI ARCHITECTURE & NESTING
- **No Nested Cards**: Tuyệt đối tránh lồng quá sâu. Cho phép tối đa 2 cấp Card (Card > CardContent > Card) nếu việc lồng giúp phân nhóm dữ liệu rõ ràng hơn. Ưu tiên dùng generic `div` hoặc Header/Content sections cho các cấp độ sâu hơn.
- **Flat Variant Pattern**: Các component phức tạp (vd: `DataTable`) hỗ trợ prop `variant="flat"`.
  - Dùng `variant="flat"` khi component nằm trong một container đã có border rõ ràng để tránh "border-stacking".

- **Standard Components Only**: Prioritize project-defined UI components (`Card`, `Badge`, `Button`). Avoid custom `div` styling if a standard component exists.
