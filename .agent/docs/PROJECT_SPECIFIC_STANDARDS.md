# PROJECT_UI_RULES_DEV.md

> Dự án: Synapse_KL
> Trạng thái: BẮT BUỘC ÁP DỤNG
> Phạm vi: DEV PHASE (Logic-first)

---

## 0. MỤC TIÊU

* Tối đa hóa tốc độ triển khai Business Logic
* Cố định UI semantics ngay từ đầu
* Loại bỏ hoàn toàn xao nhãng về UI/UX/Styling
* Tránh refactor UI làm ảnh hưởng logic về sau

---

## 1. NGÔN NGỮ & ĐẶT TÊN

* **UI Text**: 100% **Tiếng Việt**
* **Code Naming** (biến, hàm, class, file): 100% **Tiếng Anh**
* **Comment**:

  * Ngôn ngữ: **Tiếng Việt**
  * Chỉ giải thích **WHY** (Tại sao làm vậy)
  * KHÔNG giải thích **WHAT** (Code làm gì)

---

## 2. NGUYÊN TẮC: Context vs Focus

* **Ưu tiên dùng Sheet (Side panel)**:

  * Cho các thao tác Create / Edit nhanh.
  * Khi người dùng cần tham chiếu dữ liệu từ màn hình nền (giữ context).

* **Form có độ dài trung bình (scrolling chấp nhận được)**

* **Dùng Page riêng biệt**:

  * Khi Form quá phức tạp, nhiều cột, hoặc dạng Master-Detail.
  * Form có nhiều bước (Stepper/Wizard).
  * Cần không gian hiển thị tối đa để tập trung (Focus mode).

**TUYỆT ĐỐI KHÔNG**:

* Đặt Form trong Dialog thường (trừ trường hợp confirm có 1 input lý do).
* Dựng Form bằng div + state thủ công.

## 3. DIALOG RULE

* `Dialog` **KHÔNG dùng cho Form**
* CHỈ được phép dùng:

  * `AlertDialog` → Xác nhận hành động nguy hiểm (Delete, Reset, Irreversible)

---

## 4. COMPONENT SEMANTICS (SHADCN/UI)

* **BẮT BUỘC** dùng component chính danh của **shadcn/ui**
* Mỗi hành vi nghiệp vụ → đúng **01 loại component**

| Hành vi nghiệp vụ | Component bắt buộc              |
| ----------------- | ------------------------------- |
| Tạo / Sửa (CRUD)  | `Sheet` (Ưu tiên)                 |
| Nhập liệu         | `Input`, `Select` (qua Wrapper) |
| Xác nhận          | `AlertDialog`                   |
| Danh sách         | `Table`                         |
| Không có dữ liệu  | `EmptyState`                    |

**CẤM TUYỆT ĐỐI**

* Fake modal / fake form
* Workaround UI bằng `div`
* Dùng thẻ HTML trần (`input`, `select`) không wrapper

---

## 5. Form Pattern (React Hook Form + Controller)
**BẮT BUỘC**: Dùng `Controller` + `Field` primitive từ `@/shared/ui/field`.

### Pattern:
```tsx
import { useForm, Controller } from "react-hook-form"
import { Field } from "@/shared/ui/field"

const form = useForm<FormData>()

<Controller
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <Field label="Label" error={form.formState.errors.fieldName?.message}>
      <Input {...field} />
    </Field>
  )}
/>
```

**CẤM**: Dùng `form.tsx` pattern cũ (`FormField`, `FormItem`, `FormControl`).

---

## 6. STYLING RULE (KHÓA CHẶT)

### TUYỆT ĐỐI CẤM

* Màu sắc (`bg-*`, `text-*`)
* Shadow (`shadow-*`)
* Rounded (`rounded-*`)
* Icon trang trí
* Animation / Transition
* Override `className`
* Custom `variant`, `size`

### CHỈ CHO PHÉP LAYOUT TỐI THIỂU

```
flex | grid | gap-4 | p-4 | border
```

> UI chỉ dùng để **chia vùng chức năng**, không để làm đẹp.


* Page **CHỈ** compose component
* TUYỆT ĐỐI KHÔNG đặt Form trực tiếp trong Page

---

## 7. REVIEW RULE (FAIL NGAY)

PR **BỊ REJECT** nếu phát hiện:

* Form không nằm trong Sheet
* Dialog chứa `Input` / `Select`
* Có class Tailwind trang trí
* Có lý do "cho đẹp", "cho dễ nhìn"
* UI thay đổi làm ảnh hưởng Business Logic

---

## 8. CÂU HỎI KIỂM TRA CUỐI

> "Component này đại diện cho hành vi nghiệp vụ nào?"

Nếu không trả lời được → **Component sai**.

---

## 9. GHI CHÚ

* File này **CHỈ áp dụng cho DEV PHASE**
* UI polish, branding, icon, animation **KHÔNG thuộc phạm vi file này**
