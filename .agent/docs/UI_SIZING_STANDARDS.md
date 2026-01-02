# UI Component Sizing Standards

**Version:** 2025.12
**Last Updated:** 2026-01-02
**Status:** ✅ Implemented

---

## 📐 Sizing System Overview

Synapse Design System sử dụng **8px Grid System** với 3 size tiers chính:

| Size | Height | Use Case | Touch Target |
|------|--------|----------|--------------|
| **sm** | 36-40px | Secondary actions, compact UI | Below WCAG minimum |
| **default** | 44-48px | Primary actions, standard forms | ✅ WCAG AAA (44px+) |
| **lg** | 52-56px | Prominent CTAs, mobile-first | ✅ Enhanced accessibility |

---

## 🎯 Component Size Matrix

### **Form Controls** (Align with Input standards)
```tsx
Input:    sm: h-10 (40px) | default: h-12 (48px) | lg: h-14 (56px)
Select:   sm: h-10 (40px) | default: h-12 (48px) | lg: h-14 (56px)
Textarea: sm: h-10 (40px) | default: h-12 (48px) | lg: h-14 (56px)
```

**Rationale:** Form controls MUST meet touch target minimums (40px+) for accessibility.

---

### **Interactive Elements** (Compact UI)
```tsx
Button:   sm: h-9  (36px) | default: h-12 (48px) | lg: h-14 (56px)
Badge:    sm: h-5  (20px) | default: h-6  (24px) | lg: h-7  (28px)
Toggle:   sm: h-8  (32px) | default: h-9  (36px) | lg: h-10 (40px)
```

**Rationale:** Buttons can be smaller for secondary actions, but default size meets WCAG.

---

### **Hybrid Components** (Context-Dependent)
```tsx
Tabs:     sm: h-9  (36px) | default: h-10 (40px) | lg: h-12 (48px)
```

**Usage Guidelines:**
- **`size="sm"`**: Navigation contexts (CalendarToolbar, pure UI navigation)
- **`size="default"`**: Form contexts (filters, data tables, settings panels)
- **`size="lg"`**: Prominent section navigation

---

## ✅ Implementation Checklist

### **Completed:**
- [x] Button (h-9, h-12, h-14)
- [x] Input (h-10, h-12, h-14)
- [x] Select (h-10, h-12, h-14)
- [x] Tabs (h-9, h-10, h-12) ← **NEW**
- [x] Toggle (h-8, h-9, h-10)
- [x] ToggleGroup (inherits from Toggle)
- [x] Badge (h-5, h-6, h-7)

### **Verified Consistent:**
- [x] CalendarToolbar uses `<TabsList size="sm">` (h-9) + `<Button size="sm">` (h-9) ✅
- [x] All form controls align at h-10 (sm) and h-12 (default) ✅

---

## 🚨 Common Pitfalls

### ❌ **DON'T: Mix sizes without reason**
```tsx
// BAD: Button and Input don't align
<Input size="sm" />      {/* h-10 */}
<Button size="sm" />     {/* h-9 */}
```

### ✅ **DO: Use appropriate size for context**
```tsx
// GOOD: Form context - use default sizes
<Input size="default" />   {/* h-12 */}
<Button size="default" />  {/* h-12 */}

// GOOD: Navigation context - use sm sizes
<TabsList size="sm" />     {/* h-9 */}
<Button size="sm" />       {/* h-9 */}
```

---

## 📚 References

### **Industry Standards:**
- **WCAG 2.1 Level AAA**: 44x44px minimum touch target
- **iOS (Apple HIG)**: 44x44 pt minimum
- **Android (Material Design)**: 48x48 dp minimum
- **8px Grid System**: All heights divisible by 4px or 8px

### **Design Tokens:**
```css
--size-sm:      36-40px  /* Compact UI */
--size-default: 44-48px  /* Standard (WCAG compliant) */
--size-lg:      52-56px  /* Prominent CTAs */
```

---

## 🔄 Migration Guide

### **If you're updating existing components:**

1. **Check current usage:**
   ```bash
   grep -r "TabsList" src/
   ```

2. **Add size prop where needed:**
   ```tsx
   // Navigation contexts
   <TabsList size="sm">

   // Form/filter contexts
   <TabsList size="default">
   ```

3. **Verify alignment:**
   - Open browser DevTools
   - Inspect heights of adjacent components
   - Ensure they align to 8px grid

---

## 📝 Notes

- **Default sizes are WCAG-compliant** - Always use `default` unless you have a specific reason.
- **`sm` sizes are for compact UI** - Use sparingly and never for primary actions.
- **`lg` sizes are for emphasis** - Use for CTAs and mobile-first designs.
- **All sizes align to 8px grid** - This ensures visual harmony across the system.
