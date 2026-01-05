# RESEARCH_FORM_VALIDATION_UX.md

> **Ngày**: 2026-01-05
> **Vấn đề**: Người dùng không nhận biết được lỗi validation do thiếu feedback trực quan (màu đỏ, message inline) khi nhập liệu trong "Form phụ" (Sheet/Dialog).
> **Nguyên nhân**: Sử dụng `useState` thủ công thay vì `react-hook-form` + `shadcn/ui/form` primitives.

---

## 1. Nguyên lý hoạt động của Shadcn Form

Shadcn Form không chỉ là UI mà là một hệ thống Context (Wrapper around `react-hook-form`):

1.  **`FormField`**: Cung cấp `name` và tự động subscribe vào `formState` của RHF.
2.  **`FormItem`**: Cung cấp `id` cho các accessibility attributes (`aria-describedby`, `aria-invalid`).
3.  **`FormControl`**: Tự động gán `id`, `aria-invalid`, `ref` vào component con (Input, Select).
4.  **`FormMessage`**: Tự động đọc `fieldState.error?.message` và hiển thị text đỏ.

### Tại sao cách làm cũ (`useState`) thất bại?
*   Không có `formState` → `aria-invalid` luôn `false` → Input không có viền đỏ.
*   Không có `FormMessage` → Không hiện text lỗi.
*   Vi phạm quy tắc "Fake Form" trong `PROJECT_SPECIFIC_STANDARDS.md`.

---

## 2. Best Practice: Isolated Sub-Forms

Khi có một nghiệp vụ "Thêm mới" trong Dialog/Sheet tách biệt với Form chính (Main Form), ta nên coi nó là một **Form độc lập**.

### Giải pháp: "Form within a Form" (Logical Separation)

Thay vì dùng `useState` cho `newEntry`, hãy dùng một `useForm` riêng biệt cho thao tác "Add".

```tsx
// 1. Define distinct Schema for the "Add" action
const addExceptionSchema = z.object({
  date: z.date({ required_error: "Vui lòng chọn ngày" }),
  reason: z.string().min(1, "Vui lòng nhập lý do"),
  // ... check logic
})

function ExceptionSheet() {
  // 2. Separate form instance
  const addForm = useForm<z.infer<typeof addExceptionSchema>>({
    resolver: zodResolver(addExceptionSchema),
    defaultValues: { ... }
  })

  // 3. Handle Submit -> Append to Parent Field Array
  const onAdd = (data) => {
    append(data) // Add to main form
    addForm.reset() // Reset sub-form
    setOpen(false) // Close sheet
  }

  return (
    <Sheet>
       <Form {...addForm}>
          <form onSubmit={addForm.handleSubmit(onAdd)}>
             {/* 4. Use Standard Shadcn Fields */}
             <FormField
                control={addForm.control}
                name="reason"
                render={({ field }) => (
                   <FormItem>
                      <FormLabel>Lý do</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage /> {/* ✅ Auto red error */}
                   </FormItem>
                )}
             />
             <Button type="submit">Thêm</Button>
          </form>
       </Form>
    </Sheet>
  )
}
```

---

## 3. Checklist Refactor

1.  [ ] **Tạo Schema riêng**: Tách logic validation cho mục "Thêm mới".
2.  [ ] **Khởi tạo `useForm` con**: Không dùng state `newException`.
3.  [ ] **Dùng Full Shadcn Primitives**: Thay thế `div`/`Input` trần bằng `<FormField>`, `<FormItem>`, `<FormMessage>`.
4.  [ ] **Chuyển logic submit**: Validate bằng `handleSubmit` của form con trước khi `append` vào form cha.

---

> **Kết luận**: Mọi input nhập liệu, dù là phụ (Dialog/Sheet), bắt buộc phải bọc trong `Form` context để đảm bảo Consistency và Accessibility.
