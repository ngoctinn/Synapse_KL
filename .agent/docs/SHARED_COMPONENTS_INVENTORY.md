# Shared Components Inventory

**Location:** `frontend/src/shared/components/`
**Last Updated:** 2026-01-02

---

## 📦 Available Components

### **1. CalendarToolbar**
**File:** `calendar-toolbar.tsx`
**Purpose:** Calendar navigation with view switching
**Features:**
- Day/Week/Month view switcher (Tabs component)
- Previous/Next navigation
- "Today" button
- Keyboard shortcuts (D/W/M/T/←/→)
- Clickable date range display
- Responsive design

**Usage:**
```tsx
<CalendarToolbar
  currentDate={date}
  view="week"
  onViewChange={setView}
  onNavigate={setDate}
  onDateClick={() => {}}
  showViewSwitcher={true}
  availableViews={["day", "week", "month"]}
/>
```

---

### **2. SearchInput**
**File:** `search-input.tsx`
**Purpose:** Debounced search input with clear button
**Features:**
- Debounced onChange (300ms)
- Clear button
- Search icon
- Keyboard shortcuts (Escape to clear)

**Usage:**
```tsx
<SearchInput
  value={searchValue}
  onChange={setSearchValue}
  placeholder="Search..."
  debounceMs={300}
/>
```

---

### **3. MultiSelect**
**File:** `multi-select.tsx`
**Purpose:** Multi-selection dropdown with badges
**Features:**
- Checkbox list
- Selected items as badges
- Search/filter options
- "Select All" / "Clear All"
- Keyboard navigation

**Usage:**
```tsx
<MultiSelect
  options={[
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
  ]}
  selected={selectedValues}
  onChange={setSelectedValues}
  placeholder="Select items..."
/>
```

---

### **4. DatePickerWithRange**
**File:** `date-range-picker.tsx`
**Purpose:** Date range selection
**Features:**
- Calendar popover
- From/To date selection
- Preset ranges (Today, Last 7 days, etc.)
- Keyboard navigation

**Usage:**
```tsx
<DatePickerWithRange
  value={dateRange}
  onChange={setDateRange}
/>
```

---

### **5. DateTimePicker**
**File:** `date-time-picker.tsx`
**Purpose:** Combined date and time picker
**Features:**
- Calendar for date
- Time dropdown (15-min intervals)
- Combined display
- Keyboard shortcuts

**Usage:**
```tsx
<DateTimePicker
  date={dateTime}
  onChange={setDateTime}
/>
```

---

### **6. DurationSelect**
**File:** `duration-select.tsx`
**Purpose:** Service duration selection
**Features:**
- Predefined durations (15, 30, 45, 60, 90, 120 min)
- Custom duration input
- Formatted display (e.g., "1h 30m")

**Usage:**
```tsx
<DurationSelect
  value={duration}
  onChange={setDuration}
/>
```

---

### **7. PageHeader**
**File:** `page-header.tsx`
**Purpose:** Consistent page header with actions
**Features:**
- Title + description
- Action buttons slot
- Breadcrumbs integration
- Responsive layout

**Usage:**
```tsx
<PageHeader
  title="Page Title"
  description="Page description"
  actions={
    <>
      <Button>Primary</Button>
      <Button variant="outline">Secondary</Button>
    </>
  }
/>
```

---

### **8. SmartDataTable**
**File:** `smart-data-table.tsx`
**Purpose:** Advanced data table with all features
**Features:**
- Client-side pagination
- Sorting (multi-column)
- Filtering (faceted)
- Column visibility toggle
- Row selection
- Export to CSV
- Responsive (mobile cards)
- Empty states
- Loading states

**Usage:**
```tsx
<DataTable
  columns={columns}
  data={data}
  searchKey="name"
  filterableColumns={[
    { id: "status", title: "Status", options: [...] }
  ]}
/>
```

---

### **9. DataTableFacetedFilter**
**File:** `data-table-faceted-filter.tsx`
**Purpose:** Multi-select filter for table columns
**Features:**
- Checkbox list
- Search options
- Badge display
- Clear filters

**Usage:**
```tsx
<DataTableFacetedFilter
  column={table.getColumn("status")}
  title="Status"
  options={[
    { label: "Active", value: "active", icon: CheckCircle },
    { label: "Inactive", value: "inactive", icon: XCircle },
  ]}
/>
```

---

### **10. TabToolbar**
**File:** `tab-toolbar.tsx`
**Purpose:** Toolbar for tab-based interfaces
**Features:**
- Action buttons
- Search integration
- Filter controls

---

### **11. TimePickerDropdown**
**File:** `time-picker-dropdown.tsx`
**Purpose:** Standalone time picker
**Features:**
- Hour/minute selection
- 12/24 hour format
- Keyboard navigation

---

### **12. AppSidebar**
**File:** `app-sidebar.tsx`
**Purpose:** Main application sidebar
**Features:**
- Role-based navigation
- Collapsible
- User profile section
- Active route highlighting

---

### **13. BottomNav**
**File:** `bottom-nav.tsx`
**Purpose:** Mobile bottom navigation
**Features:**
- Icon-based navigation
- Active state
- Badge support

---

### **14. DashboardHeaderTitle**
**File:** `dashboard-header-title.tsx`
**Purpose:** Dashboard page title component
**Features:**
- Consistent styling
- Icon support

---

### **15. RoleGuard**
**File:** `role-guard.tsx`
**Purpose:** Role-based access control
**Features:**
- Show/hide content by role
- Redirect unauthorized users

**Usage:**
```tsx
<RoleGuard allowedRoles={["manager", "receptionist"]}>
  <AdminPanel />
</RoleGuard>
```

---

## 📊 Component Categories

### **Navigation (4)**
- CalendarToolbar
- AppSidebar
- BottomNav
- TabToolbar

### **Data Input (6)**
- SearchInput
- MultiSelect
- DatePickerWithRange
- DateTimePicker
- DurationSelect
- TimePickerDropdown

### **Data Display (2)**
- SmartDataTable
- DataTableFacetedFilter

### **Layout (3)**
- PageHeader
- DashboardHeaderTitle
- RoleGuard

---

## 🎯 Usage Patterns

### **Form Context:**
```tsx
<PageHeader title="Create Booking">
  <DateTimePicker date={date} onChange={setDate} />
  <DurationSelect value={duration} onChange={setDuration} />
  <MultiSelect options={services} selected={selected} onChange={setSelected} />
  <Button>Submit</Button>
</PageHeader>
```

### **Table Context:**
```tsx
<PageHeader title="Staff Management">
  <SearchInput value={search} onChange={setSearch} />
  <DataTableFacetedFilter column={statusColumn} title="Status" />
</PageHeader>
<SmartDataTable columns={columns} data={data} />
```

### **Calendar Context:**
```tsx
<CalendarToolbar
  currentDate={date}
  view={view}
  onViewChange={setView}
  onNavigate={setDate}
/>
<SchedulingGrid date={date} view={view} />
```

---

## 📝 Notes

- All components follow FSD architecture
- TypeScript strict mode compliant
- Accessible (WCAG AA minimum)
- Mobile-responsive
- Dark mode support
- Consistent with design system

---

**For implementation details, see individual component files.**
