# Component Variants Reference

**Version:** 2025.12
**Last Updated:** 2026-01-02

---

## 📦 Complete Component Matrix

### **1. Button**

#### **Variants:**
| Variant | Use Case | Example |
|---------|----------|---------|
| `default` | Primary actions | Submit, Save, Confirm |
| `destructive` | Dangerous actions | Delete, Remove, Cancel |
| `outline` | Secondary actions (branded) | Edit, View Details |
| `outline-neutral` | Secondary actions (neutral) | Cancel, Back |
| `secondary` | Tertiary actions | More Options, Settings |
| `ghost` | Minimal actions | Close, Dismiss |
| `link` | Text links | Learn More, Read Docs |

#### **Sizes:**
| Size | Height | Use Case |
|------|--------|----------|
| `sm` | 36px (h-9) | Compact UI, table actions |
| `default` | 48px (h-12) | Standard buttons |
| `lg` | 56px (h-14) | Prominent CTAs |
| `icon-sm` | 36px (size-9) | Small icon buttons |
| `icon` | 48px (size-12) | Standard icon buttons |
| `icon-lg` | 56px (size-14) | Large icon buttons |

#### **States:**
- `normal` - Default state
- `disabled` - Non-interactive
- `loading` - Async operation in progress

---

### **2. Badge**

#### **Variants:**
| Variant | Color | Use Case |
|---------|-------|----------|
| `default` | Primary | Default labels |
| `secondary` | Muted | Secondary info |
| `destructive` | Red | Errors, critical |
| `outline` | Border only | Neutral tags |
| `success` | Green | Success states |
| `warning` | Yellow/Orange | Warnings |
| `info` | Blue | Informational |

#### **Sizes:**
| Size | Height | Use Case |
|------|--------|----------|
| `sm` | 20px (h-5) | Compact badges |
| `default` | 24px (h-6) | Standard badges |
| `lg` | 28px (h-7) | Prominent badges |

---

### **3. Input**

#### **Sizes:**
| Size | Height | Use Case |
|------|--------|----------|
| `sm` | 40px (h-10) | Compact forms |
| `default` | 48px (h-12) | Standard forms |
| `lg` | 56px (h-14) | Prominent inputs |

#### **States:**
- `normal` - Default state
- `disabled` - Non-editable
- `error` (via `aria-invalid`) - Validation error

---

### **4. Select**

#### **Sizes:**
| Size | Height | Use Case |
|------|--------|----------|
| `sm` | 40px (h-10) | Compact forms |
| `default` | 48px (h-12) | Standard forms |
| `lg` | 56px (h-14) | Prominent selects |

---

### **5. Tabs**

#### **Sizes:**
| Size | Height | Use Case |
|------|--------|----------|
| `sm` | 36px (h-9) | Navigation contexts |
| `default` | 40px (h-10) | Form/filter contexts |
| `lg` | 48px (h-12) | Prominent sections |

---

### **6. Toggle**

#### **Variants:**
| Variant | Style |
|---------|-------|
| `default` | Transparent background |
| `outline` | Bordered |

#### **Sizes:**
| Size | Height |
|------|--------|
| `sm` | 32px (h-8) |
| `default` | 36px (h-9) |
| `lg` | 40px (h-10) |

---

## 🎨 Usage Examples

### **Form Context (Aligned Heights)**
```tsx
<div className="space-y-4">
  <Input size="sm" />          {/* h-10 */}
  <Select size="sm">...</Select> {/* h-10 */}
  <TabsList size="default">...</TabsList> {/* h-10 */}
  <Button size="default">Submit</Button> {/* h-12 */}
</div>
```

### **Navigation Context (Compact)**
```tsx
<div className="flex items-center gap-2">
  <TabsList size="sm">...</TabsList> {/* h-9 */}
  <Button size="sm">Action</Button> {/* h-9 */}
</div>
```

### **Status Indicators**
```tsx
<div className="flex gap-2">
  <Badge variant="success">Active</Badge>
  <Badge variant="warning">Pending</Badge>
  <Badge variant="destructive">Error</Badge>
</div>
```

---

## 📊 Size Alignment Matrix

| Context | Input | Select | Tabs | Button |
|---------|-------|--------|------|--------|
| **Compact Forms** | sm (h-10) | sm (h-10) | default (h-10) | default (h-12) |
| **Standard Forms** | default (h-12) | default (h-12) | default (h-10) | default (h-12) |
| **Navigation** | - | - | sm (h-9) | sm (h-9) |
| **Prominent** | lg (h-14) | lg (h-14) | lg (h-12) | lg (h-14) |

---

## ✅ Quick Reference

### **When to use each size:**

**`sm` (Small):**
- ✅ Compact UI (tables, toolbars)
- ✅ Secondary actions
- ✅ Navigation elements
- ❌ Primary form submissions

**`default` (Standard):**
- ✅ Primary actions
- ✅ Standard forms
- ✅ WCAG-compliant touch targets
- ✅ Most use cases

**`lg` (Large):**
- ✅ Prominent CTAs
- ✅ Mobile-first designs
- ✅ Landing pages
- ✅ Marketing content

---

## 🔍 Component Discovery

To see all variants in action, visit:
```
/design-system
```

Sections:
- **Component Sizing Standards** - All size variants
- **Component Variants** - All style variants
- **Interactive States** - Hover, focus, disabled, loading
