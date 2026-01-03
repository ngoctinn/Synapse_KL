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

## 6. SHADCN/UI BEST PRACTICES (FSD)
> **Core Rule**: `shared/ui` defines styles. Features use components AS-IS, NO style overrides.

### 6.1 Button
- **Loading**: Use `loading={isPending}` prop. ❌ Never manual `<Loader2>` + `disabled`.
- **Sizes**: Use variants `sm | icon-sm | default | lg | icon | icon-lg`. ❌ Never `className="h-11"`.
- **Cancel**: Always `variant="ghost"`.
- **Shadows**: ❌ Never `shadow-lg shadow-primary/20` overrides in features.

### 6.2 Icons (Lucide)
- **Size Order**: Always `h-4 w-4` (height first). ❌ Never `w-4 h-4`.
- **Stroke**: Use default. ❌ Never `stroke-2`.
- **Standard Size**: `h-4 w-4` for buttons/actions. Only `h-5 w-5` for standalone display.

### 6.3 Form Components
- **Textarea**: Always `className="resize-none min-h-[100px]"`.
- **Input/Select**: Use default height. ❌ Never `className="h-11"`.
- **SelectTrigger**: Only `className="w-full"` if needed. No height override.

### 6.4 Sheet Forms (Standard Pattern)
```tsx
<SheetContent className="sm:max-w-md w-full overflow-y-auto">
  <SheetHeader>...</SheetHeader>
  <Form {...form}>
    <form onSubmit={...} className="space-y-4 py-4">
      {/* Fields */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost">Hủy</Button>
        <Button type="submit" loading={isPending}>Lưu</Button>
      </div>
    </form>
  </Form>
</SheetContent>
```

### 6.5 Import Rules
- ❌ Never import `Loader2`, `Save` icons for submit buttons (Button has `loading` prop).
- ✅ Only import icons for display/status purposes.

## 7. STANDARD COMPONENTS
- Prioritize project-defined UI (`Card`, `Badge`, `Button`). Avoid custom `div` styling if component exists.
