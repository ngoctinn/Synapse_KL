# API Architecture Deep Analysis - Line-by-Line Review

**Date**: January 3, 2026  
**Scope**: Detailed analysis of 3 Server Actions files (services, staff, system-settings)  
**Framework**: Next.js 15+ App Router  
**Target Pattern**: Feature-Sliced Design (FSD)

---

## 1. Executive Summary: Critical Issues Found

### 🔴 Three Distinct Error Handling Patterns Detected

| Feature | Pattern | Lines | Risk Level |
|---------|---------|-------|-----------|
| **services/actions.ts** | Custom `fetchAPI<T>()` wrapper | 30-57 | 🟠 MEDIUM |
| **staff/actions.ts** | Try-catch with inline error handling | 22-147 | 🟠 MEDIUM |
| **system-settings/actions.ts** | Direct throw + manual error parsing | 13-50 | 🟡 LOW |

### ❌ Core FSD Violations

1. **No shared API client** - Each feature reimplements fetch logic
2. **Mixed error handling** - 3 different patterns across 3 files
3. **No DTO/mappers** - Direct API response usage without validation
4. **No endpoint constants** - Paths scattered: `/api/v1/skills`, `/api/v1/staff`, `/api/v1/settings/operational/`
5. **Inconsistent caching** - `cache: "no-store"` vs `revalidate: 60` vs `revalidate: 3600`
6. **No request validation** - Direct pass-through to API without schema checking
7. **Missing auth layer** - No centralized auth header management

---

## 2. SERVICES/ACTIONS.TS - Line-by-Line Analysis

### File: `frontend/src/features/services/actions.ts` (338 lines)

#### 📌 Lines 1-30: Setup & Custom Wrapper Definition

```typescript
"use server";                                    // Line 1: ✅ CORRECT - Server Action directive

import { API_BASE_URL } from "@/shared/api";   // Line 3: ⚠️ ANTI-PATTERN
                                                // Issue: API_BASE_URL is ONLY constant exported
                                                // Missing: API client, error types, DTOs
                                                // FSD expects: shared/api/{client,errors,models,mappers}

import { revalidatePath } from "next/cache";   // Line 4: ✅ CORRECT - Cache invalidation

// Type imports (Lines 6-20)                    // ✅ CORRECT - All type imports, no JS
const SERVICES_PATH = "/api/v1/services";      // Line 24: 🔴 ANTI-PATTERN
const SKILLS_PATH = "/api/v1/skills";          // Line 25: 🔴 Anti-pattern - Hardcoded paths
const CATEGORIES_PATH = "/api/v1/categories";  // Line 26: 🔴 Should be in shared/api/endpoints.ts
const RESOURCES_PATH = "/api/v1/resources";    // Line 27: 🔴 Not centralized

// ⚠️ PROBLEM: These constants are redefined in staff/actions.ts (STAFF_PATH, SCHEDULING_PATH)
// ⚠️ FSD Solution: should be in shared/api/config.ts or shared/api/endpoints/index.ts
```

**Issue Details:**
- **Line 24-27**: Hardcoded API paths violate DRY principle
- **Location Problem**: Same patterns in `staff/actions.ts` (lines 14-15)
- **Correct Pattern** (FSD):
```typescript
// shared/api/endpoints/index.ts
export const API_ENDPOINTS = {
  SKILLS: "/api/v1/skills",
  CATEGORIES: "/api/v1/categories",
  RESOURCES: "/api/v1/resources",
  SERVICES: "/api/v1/services",
  STAFF: "/api/v1/staff",
  SCHEDULING: "/api/v1/scheduling",
  SETTINGS: "/api/v1/settings/operational",
} as const;
```

#### 📌 Lines 30-57: Custom `fetchAPI<T>()` Wrapper

```typescript
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message?: string; data?: T }> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {  // Line 37
      ...options,
      headers: {
        "Content-Type": "application/json",                   // Line 40
        ...options.headers,
      },
    });

    if (!res.ok) {                                           // Line 44
      const err = await res.json().catch(() => ({}));       // Line 45
      return {
        success: false,
        message: err.detail || `Lỗi ${res.status}: ${res.statusText}`,
      };
    }

    // Handle 204 No Content (Line 52)                       // ✅ GOOD
    if (res.status === 204) {
      return { success: true };
    }

    const data = await res.json();                           // Line 57
    return { success: true, data };
  } catch (error) {                                          // Line 59
    console.error(`Fetch Error [${endpoint}]:`, error);      // ✅ GOOD - logging
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}
```

**Issues Identified:**

| Line | Issue | Severity | FSD Violation |
|------|-------|----------|--------------|
| 30-61 | Custom wrapper = code duplication | 🟠 MEDIUM | YES - should be in shared/api/client |
| 40 | Hardcoded Content-Type header | 🟡 LOW | YES - should be in client config |
| 45 | Manual error parsing with `.catch()` | 🟠 MEDIUM | YES - should have error handler |
| 45 | `err.detail` assumes Backend format | 🟠 MEDIUM | YES - no adapter/mapper |
| 59-61 | Generic error message in Vietnamese | 🟡 LOW | YES - no error type discrimination |

**Why This Is Wrong:**

1. **Duplication**: This wrapper will appear in `staff/actions.ts` too (try-catch variant)
2. **No Type Safety**: `APIErrorResponse` type NOT defined here
3. **Backend Coupling**: Assumes backend returns `err.detail` field
4. **No Validation**: Response data not validated against expected schema
5. **Missing Interceptors**: No auth header, no request logging, no retry logic

**Correct FSD Pattern:**

```typescript
// shared/api/client.ts
export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  code?: string;
  status: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: ApiErrorResponse }> {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          // Add auth header from session
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      });

      if (!res.ok) {
        const error = await this.parseError(res);
        return { success: false, error };
      }

      if (res.status === 204) {
        return { success: true };
      }

      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: { status: 500, message: "Connection error" },
      };
    }
  }

  private async parseError(res: Response): Promise<ApiErrorResponse> {
    const data = await res.json().catch(() => ({}));
    return {
      status: res.status,
      detail: data.detail,
      message: data.message,
      code: data.code,
    };
  }

  private getAuthHeaders(): Record<string, string> {
    // Get from session/cookies when auth is implemented
    return {};
  }
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL!);
```

Then in actions:
```typescript
import { apiClient } from "@/shared/api/client";

export async function createSkillAction(data: SkillCreateInput) {
  const res = await apiClient.fetch<Skill>(API_ENDPOINTS.SKILLS, {
    method: "POST",
    body: JSON.stringify(data),
  });
  // ...
}
```

---

#### 📌 Lines 64-105: Skills CRUD Actions

```typescript
export async function getSkillsAction(): Promise<Skill[]> {
  const res = await fetch(`${API_BASE_URL}${SKILLS_PATH}`, {  // Line 65
    cache: "no-store",                                        // Line 66 - ⚠️ ISSUE
  });
  if (!res.ok) throw new Error("Không thể tải danh sách kỹ năng");
  return res.json();                                          // Line 69 - ⚠️ ISSUE
}
```

**Issues:**

| Line | Code | Issue | Severity |
|------|------|-------|----------|
| 65 | `fetch(..., { cache: "no-store" })` | ❌ Direct fetch NOT using wrapper | 🔴 CRITICAL |
| 66 | `cache: "no-store"` | ✅ Correct - skills change frequently | 🟢 OK |
| 69 | `return res.json()` | ❌ No validation, no error handling | 🟠 MEDIUM |

**Problem**: `getSkillsAction` uses DIRECT fetch, but `createSkillAction` uses custom `fetchAPI` wrapper!

```typescript
export async function createSkillAction(data: SkillCreateInput) {  // Line 75
  const res = await fetchAPI<Skill>(SKILLS_PATH, {               // Line 76 - Uses wrapper
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/dashboard/manager/services", "page");
  return {
    ...res,
    message: res.success ? "Tạo kỹ năng thành công" : res.message,
  };
}
```

**Inconsistency**: Two methods for the same endpoint!
- `getSkillsAction`: Direct `fetch()` + throw
- `createSkillAction`: Custom `fetchAPI()` + return object

```typescript
export async function updateSkillAction(id: string, data: SkillUpdateInput) {
  const res = await fetchAPI(`${SKILLS_PATH}/${id}`, {          // Line 85
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/dashboard/manager/services", "page");
  return {
    ...res,
    message: res.success ? "Cập nhật kỹ năng thành công" : res.message,
  };
}

export async function deleteSkillAction(id: string): Promise<void> {
  const res = await fetchAPI(`${SKILLS_PATH}/${id}`, { method: "DELETE" });
  if (!res.success) throw new Error(res.message);              // Line 96 - throws
  revalidatePath("/dashboard/manager/services", "page");
}
```

**Pattern Violations:**

| Function | Fetch Method | Error Handling | Return Type | Issue |
|----------|--------------|----------------|-------------|-------|
| `getSkillsAction` | Direct fetch | throws | `Skill[]` | Inconsistent with others |
| `createSkillAction` | fetchAPI wrapper | returns object | `{success, message, data?}` | OK |
| `updateSkillAction` | fetchAPI wrapper | returns object | `{success, message, data?}` | OK |
| `deleteSkillAction` | fetchAPI wrapper | throws | `void` | throws instead of returns |

**Correct FSD Pattern**: All use same client, consistent return type

```typescript
// shared/api/endpoints/skills.ts
export const skillsEndpoint = {
  getAll: async () => {
    return apiClient.fetch<Skill[]>(API_ENDPOINTS.SKILLS, {
      next: { revalidate: 0, tags: ["skills"] },
    });
  },

  create: async (data: SkillCreateInput) => {
    return apiClient.fetch<Skill>(API_ENDPOINTS.SKILLS, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: SkillUpdateInput) => {
    return apiClient.fetch<Skill>(`${API_ENDPOINTS.SKILLS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiClient.fetch(`${API_ENDPOINTS.SKILLS}/${id}`, {
      method: "DELETE",
    });
  },
};
```

Then in component actions:
```typescript
import { skillsEndpoint } from "@/shared/api/endpoints/skills";
import { revalidatePath } from "next/cache";

export async function createSkillAction(data: SkillCreateInput) {
  const result = await skillsEndpoint.create(data);
  
  if (result.success) {
    revalidatePath("/dashboard/manager/services", "page");
  }
  
  return {
    success: result.success,
    message: result.success ? "Tạo kỹ năng thành công" : result.error?.message,
    data: result.data,
  };
}
```

---

#### 📌 Lines 106-154: Categories CRUD

**Pattern**: Same issues as Skills
- Line 106: Direct fetch for `getCategoriesAction`
- Line 114-121: Wrapper for create
- Line 123-130: Wrapper for update
- Line 132-140: Wrapper for reorder (special case)
- Line 142-146: Wrapper for delete (throws)

**Inconsistencies**: Mix of direct fetch + wrapper, throw + return

---

#### 📌 Lines 155-210: Resource Groups & Resources

**Same Pattern Violations**:
- Line 155-160: Direct fetch for get
- Line 162-169: Wrapper for create
- Line 171-175: Wrapper for delete (throws)

---

#### 📌 Lines 211-280: Services CRUD

```typescript
export async function getServicesAction(
  categoryId?: string,
  isActive?: boolean,
  page: number = 1,
  limit: number = 1000
): Promise<{ data: Service[]; total: number; page: number; limit: number }> {
  const params = new URLSearchParams();                    // Line 216 - ✅ GOOD query building
  if (categoryId) params.append("category_id", categoryId);
  if (isActive !== undefined) params.append("is_active", String(isActive));
  params.append("page", String(page));
  params.append("limit", String(limit));

  const url = `${API_BASE_URL}${SERVICES_PATH}?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Không thể tải danh sách dịch vụ");
  const responseData = await res.json();

  // Backend trả về ServiceListResponse format: { data, total, page, limit }
  if (responseData.data && typeof responseData.total === "number") {
    return responseData;
  }

  // Fallback nếu backend trả array trực tiếp (backward compatibility)
  return {
    data: Array.isArray(responseData) ? responseData : [],
    total: Array.isArray(responseData) ? responseData.length : 0,
    page: 1,
    limit: 1000,
  };
}
```

**Issues:**

| Issue | Line | Severity |
|-------|------|----------|
| Manual param building (should use query builder) | 216-220 | 🟡 LOW |
| No validation of responseData structure | 227-234 | 🔴 CRITICAL - no schema validation |
| Backward compatibility hack (fallback logic) | 229-234 | 🟠 MEDIUM - code smell |
| No DTO/mapper for response | 227 | 🔴 CRITICAL - returns raw API response |

**Backward Compat Problem**: Lines 229-234 indicate API contract uncertainty. Should use Zod schema:

```typescript
// shared/api/schemas/services.ts
import { z } from "zod";

export const ServiceListResponseSchema = z.object({
  data: z.array(ServiceSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

// Then in action:
const validated = ServiceListResponseSchema.parse(responseData);
```

---

#### 📌 Lines 280-310: Service Creation with Data Transformation

```typescript
export async function createServiceAction(data: ServiceCreateInput) {
  const payload = {
    ...data,
    category_id:
      data.category_id && data.category_id !== "uncategorized"  // Line 285 - Magic string!
        ? data.category_id
        : undefined,
    image_url: data.image_url || undefined,
    description: data.description || undefined,
  };

  const res = await fetchAPI(SERVICES_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  // ...
}
```

**Issues:**

| Issue | Line | Severity | FSD Violation |
|-------|------|----------|---------------|
| Magic string `"uncategorized"` | 285 | 🟠 MEDIUM | Should be constant |
| Manual payload transformation | 283-290 | 🔴 CRITICAL | Should use DTO mapper |
| No validation before sending | 295 | 🔴 CRITICAL | Should validate with Zod |

**Correct Pattern** (with DTO mapper):

```typescript
// shared/api/mappers/services.ts
export function adaptServiceCreatePayload(data: ServiceCreateInput): ServiceCreatePayload {
  return {
    ...data,
    category_id:
      data.category_id && data.category_id !== SERVICE_CATEGORIES.UNCATEGORIZED
        ? data.category_id
        : null,
    image_url: data.image_url ?? null,
    description: data.description ?? null,
  };
}

// shared/api/constants/services.ts
export const SERVICE_CATEGORIES = {
  UNCATEGORIZED: "uncategorized",
} as const;

// Then in action:
const payload = adaptServiceCreatePayload(data);
// Validate before sending
const validated = ServiceCreatePayloadSchema.parse(payload);
const res = await apiClient.fetch<Service>(API_ENDPOINTS.SERVICES, {
  method: "POST",
  body: JSON.stringify(validated),
});
```

---

## 3. STAFF/ACTIONS.TS - Line-by-Line Analysis

### File: `frontend/src/features/staff/actions.ts` (311 lines)

#### 📌 Lines 1-20: Setup & Type Definition

```typescript
"use server";                                    // Line 1: ✅ Correct

import { API_BASE_URL } from "@/shared/api";   // Line 3: Same issue as services
import { revalidatePath } from "next/cache";   // Line 4: ✅ Correct

// Type imports
const STAFF_PATH = "/api/v1/staff";            // Line 14: 🔴 Same hardcoding issue
const SCHEDULING_PATH = "/api/v1/scheduling";  // Line 15: 🔴 Same hardcoding issue

interface APIErrorResponse {                    // Line 17: ⚠️ DIFFERENT from services
  detail?: string;                              // Redefined here instead of shared/api
}
```

**Issues:**

| Issue | Line | Severity |
|-------|------|----------|
| `APIErrorResponse` redefined here | 17-19 | 🔴 CRITICAL - duplicated type |
| Not in shared/api/errors.ts | 17-19 | 🔴 CRITICAL - should be centralized |
| Different from services error handling | 17-19 | 🟠 MEDIUM - inconsistent |

This type is ONLY used in staff/actions.ts but would need to be in system-settings too!

#### 📌 Lines 22-44: Try-Catch Pattern for Invite

```typescript
export async function inviteStaffAction(data: StaffInviteInput) {
  try {                                                          // Line 23: Different from services!
    const res = await fetch(`${API_BASE_URL}${STAFF_PATH}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },         // Line 26: Inline headers
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = (await res.json()) as APIErrorResponse;      // Line 30: Cast not validation
      return { success: false, message: err.detail || "Không thể gửi lời mời" };
    }

    revalidatePath("/dashboard/manager/staff");
    return { success: true, message: `Đã gửi lời mời đến ${data.email}` };
  } catch (e) {
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}
```

**Critical Difference from Services:**

| Feature | Services | Staff | Issue |
|---------|----------|-------|-------|
| Fetch Wrapper | Uses custom `fetchAPI()` | Uses try-catch | ❌ INCONSISTENT |
| Error Parsing | Custom wrapper | Inline (`as APIErrorResponse`) | ❌ TYPE UNSAFE |
| Type Safety | Generic `<T>` | Cast with `as` | ❌ NO VALIDATION |
| Return Pattern | `{success, message, data?}` | Same | ✅ Consistent return |

**Problems:**

1. **Line 23**: try-catch is pattern 1, services use pattern 2 (custom wrapper)
2. **Line 30**: `as APIErrorResponse` is unsafe - could throw at runtime if format changes
3. **Line 26**: Headers hardcoded inline instead of using wrapper
4. **No validation**: `await res.json()` could fail and throw uncaught

#### 📌 Lines 46-70: Get Staff Action

```typescript
export async function getStaffAction(): Promise<StaffProfileWithSkills[]> {
  const res = await fetch(`${API_BASE_URL}${STAFF_PATH}`, {
    next: { revalidate: 60, tags: ["staff"] },                // Line 49: DIFFERENT cache strategy
  });
  if (!res.ok) throw new Error("Không thể tải danh sách nhân viên");
  return res.json();
}
```

**Issues:**

| Issue | Line | Severity |
|-------|------|----------|
| `revalidate: 60` (1 min) vs services `cache: "no-store"` | 49 | 🔴 CRITICAL - INCONSISTENT |
| ISR tag-based revalidation | 49 | ⚠️ Different strategy than services |
| Direct throw vs wrapper | 51 | 🟠 MEDIUM - inconsistent error pattern |
| No response validation | 52 | 🔴 CRITICAL - no schema check |

**Why This Matters**: 

- Services: Staff list changes rarely → use `revalidate: 60` ✅
- Services: Skills list changes frequently → use `cache: "no-store"` ✅
- **But**: Should be documented, not randomly different!

#### 📌 Lines 72-150: Mixed Update Patterns

```typescript
export async function createStaffProfileAction(data: StaffProfileCreateInput) {
  try {                                                          // Pattern: try-catch
    const res = await fetch(`${API_BASE_URL}${STAFF_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = (await res.json()) as APIErrorResponse;
      return { success: false, message: err.detail || "Không thể tạo hồ sơ nhân viên" };
    }
    revalidatePath("/dashboard/manager/staff");
    return { success: true, message: "Tạo hồ sơ nhân viên thành công" };
  } catch (e) {                                                  // Generic catch
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}
```

**Repetition**: This pattern repeats for:
- Line 72: `createStaffProfileAction`
- Line 90: `updateStaffProfileAction` 
- Line 108: `updateStaffSkillsAction`

**Each one**: ~20 lines of boilerplate fetch + error handling

**Multiplication**: Imagine 10 features with 20 actions = 4000 lines of duplicated code!

#### 📌 Lines 125-165: Complex Composite Action

```typescript
export async function updateStaffWithSkillsAction(
  id: string,
  profileData: StaffProfileUpdateInput,
  skillsData: StaffSkillsUpdate
) {
  try {
    // 1. Update Profile
    const profileRes = await fetch(`${API_BASE_URL}${STAFF_PATH}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });

    if (!profileRes.ok) {
       const err = await profileRes.json() as APIErrorResponse;
       return { success: false, message: err.detail || "Lỗi cập nhật thông tin chung" };
    }

    // 2. Update Skills
    const skillsRes = await fetch(`${API_BASE_URL}${STAFF_PATH}/${id}/skills`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skillsData),
    });

    // ...
  }
}
```

**Issues:**

| Line | Issue | Severity |
|------|-------|----------|
| 132-145 | Sequential operations | 🟠 MEDIUM - should parallel |
| 131-165 | No transaction semantics | 🔴 CRITICAL - partial updates possible |
| 140 | Profile updated, skills fail → inconsistent | 🔴 CRITICAL |
| 150 | Comment mentions "parallel usually fine" | ⚠️ Conflicting guidance |

**Better Pattern**: Either parallel (with error handling) or transaction:

```typescript
export async function updateStaffWithSkillsAction(
  id: string,
  profileData: StaffProfileUpdateInput,
  skillsData: StaffSkillsUpdate
) {
  const [profileRes, skillsRes] = await Promise.all([
    apiClient.fetch(`${API_ENDPOINTS.STAFF}/${id}`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),
    apiClient.fetch(`${API_ENDPOINTS.STAFF}/${id}/skills`, {
      method: "PUT",
      body: JSON.stringify(skillsData),
    }),
  ]);

  if (!profileRes.success || !skillsRes.success) {
    // Decide: fail or partial success?
    return {
      success: false,
      message: "Cập nhật không hoàn toàn thành công",
      partial: {
        profile: profileRes.success,
        skills: skillsRes.success,
      },
    };
  }

  revalidatePath("/dashboard/manager/staff");
  return { success: true, message: "Cập nhật thành công" };
}
```

#### 📌 Lines 180-250: Scheduling CRUD Actions

**Pattern continues**: Same try-catch pattern, same repetition

```typescript
export async function batchCreateSchedulesAction(data: StaffScheduleBatchCreateInput) {
  try {
    const res = await fetch(`${API_BASE_URL}${SCHEDULING_PATH}/schedules/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    // ...
  } catch (error) {
    console.error("Batch Create Schedules Error:", error);
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}

export async function bulkCreateSchedulesAction(items: StaffScheduleBatchCreateInput[]) {
  try {
    // Parallelize requests on the server side (low latency to backend)
    const responses = await Promise.all(
      items.map(item =>
        fetch(`${API_BASE_URL}${SCHEDULING_PATH}/schedules/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(async res => {
          if (!res.ok) {
            const err = (await res.json()) as APIErrorResponse;
            throw new Error(err.detail || `Lỗi với nhân viên ${item.staff_id}`);
          }
          const data = await res.json();
          return data as { id: string }[];
        })
      )
    );

    const createdIds = responses.flat().map(s => s.id).filter(Boolean);

    revalidatePath("/dashboard/manager/staff");
    return {
      success: true,
      message: `Đã phân ca cho ${items.length} nhân viên`,
      createdIds
    };
  } catch (error: unknown) {
    console.error("Bulk Create Schedules Error:", error);
    const message = error instanceof Error ? error.message : "Lỗi khi xử lý hàng loạt";
    return { success: false, message, createdIds: [] };
  }
}
```

**Issues:**

| Issue | Severity |
|-------|----------|
| `bulkCreateSchedulesAction` duplicates logic from `batchCreateSchedulesAction` | 🔴 CRITICAL |
| Manual `Promise.all()` with inline error handling | 🔴 CRITICAL |
| `as APIErrorResponse` cast (type unsafe) | 🔴 CRITICAL |
| `response as { id: string }[]` cast (type unsafe) | 🔴 CRITICAL |
| No schema validation of response | 🔴 CRITICAL |

---

## 4. SYSTEM-SETTINGS/ACTIONS.TS - Line-by-Line Analysis

### File: `frontend/src/features/system-settings/actions.ts` (111 lines)

#### 📌 Lines 1-30: Setup & Approach

```typescript
"use server"                                    // Line 1: ✅ Correct

import { API_BASE_URL } from "@/shared/api";  // Line 3: Same issue
import { revalidatePath } from "next/cache";  // Line 4: ✅ Correct

const API_ENDPOINT = `${API_BASE_URL}/api/v1/settings/operational/`;  // Line 6: 🔴 DIFFERENT path format
```

**Issue**: Path format is different!
- Services: `/api/v1/skills` (imported as constant)
- Staff: `/api/v1/staff` (imported as constant)
- Settings: `${API_BASE_URL}/api/v1/settings/operational/` (hardcoded with full URL)

Why is one different? Inconsistent!

#### 📌 Lines 33-68: Get Settings with Normalization

```typescript
export async function getOperationalSettingsAction() {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 3600,                      // Line 43: 1 hour - longest of all
        tags: ["operational-settings"]
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.statusText}`);  // Throws
    }

    const data = await response.json();

    // Chuẩn hóa định dạng thời gian từ HH:mm:ss sang HH:mm để khớp với UI dropdown
    if (data.regular_operating_hours) {
      data.regular_operating_hours = data.regular_operating_hours.map((h: OperatingHour) => ({
        ...h,
        open_time: h.open_time?.slice(0, 5) || "08:00",  // ⚠️ Data transformation!
        close_time: h.close_time?.slice(0, 5) || "20:00",
      }));
    }

    if (data.exception_dates) {
      data.exception_dates = data.exception_dates.map((d: ExceptionDate, index: number) => ({
        ...d,
        id: d.id || `${d.date}-${index}`,     // ⚠️ DANGEROUS - Using array index as fallback ID!
        open_time: d.open_time?.slice(0, 5) || undefined,
        close_time: d.close_time?.slice(0, 5) || undefined,
      }));
    }

    return data;
  } catch (error) {
    console.error("Error in getOperationalSettingsAction:", error);
    throw error;                                // Pattern 3: Direct throw
  }
}
```

**CRITICAL ISSUES:**

| Issue | Line | Severity | Impact |
|-------|------|----------|--------|
| Manual string slicing for time | 54, 55, 62, 63 | 🔴 CRITICAL | Should use date library |
| `id: d.id \|\| \`${d.date}-${index}\`` | 60 | 🔴 CRITICAL | Array index as ID = BUG |
| Data transformation in action | 51-65 | 🔴 CRITICAL | Should be in adapter/mapper |
| Direct throw (pattern 3) | 68-70 | 🟠 MEDIUM | Different from services/staff |
| No schema validation | 45 | 🔴 CRITICAL | No Zod validation |
| Type cast with `:` | 53 | ⚠️ LOW | Not validated |

**The ID Problem** (Line 60):
```typescript
id: d.id || `${d.date}-${index}`,
```

This is DANGEROUS because:
1. If backend doesn't return `id`, fallback uses array index
2. Array index changes if you delete middle item → ID changes!
3. Later: trying to delete by ID fails because ID is wrong

Should be:
```typescript
id: d.id || crypto.randomUUID(),  // Client-generated UUID if missing
```

Or better: ensure backend ALWAYS returns ID

#### 📌 Lines 70-111: Update Settings with Same Issues

```typescript
export async function updateOperationalSettingsAction(settings: OperationalSettings) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Note: Auth token should be added here once frontend auth is ready  // ⚠️ TODO comment
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
      console.error("Backend Error Details:", JSON.stringify(errorData, null, 2));
      if (Array.isArray(errorData.detail)) {
         throw new Error(JSON.stringify(errorData.detail));
      }
      throw new Error(errorData.detail || "Failed to update settings");  // Pattern 3: throw
    }

    const data = await response.json();

    // Chuẩn hóa định dạng để khớp với Frontend (tương tự như hàm get)
    if (data.regular_operating_hours) {
      data.regular_operating_hours = data.regular_operating_hours.map((h: OperatingHour) => ({
        ...h,
        id: crypto.randomUUID(),  // ⚠️ ADDS ID here (inconsistent with get)
        open_time: h.open_time?.slice(0, 5) || "08:00",
        close_time: h.close_time?.slice(0, 5) || "20:00",
      }));
    }

    if (data.exception_dates) {
      data.exception_dates = data.exception_dates.map((d: ExceptionDate) => ({
        ...d,
        id: d.id || crypto.randomUUID(),
        open_time: d.open_time?.slice(0, 5) || undefined,
        close_time: d.close_time?.slice(0, 5) || undefined,
      }));
    }

    // Refresh cache tại các trang liên quan sau khi cập nhật thành công
    revalidatePath("/dashboard/manager/settings");

    return { success: true, data };
  } catch (error) {
    console.error("Error in updateOperationalSettingsAction:", error);
    return { success: false, error: (error as Error).message };
  }
}
```

**Issues:**

| Issue | Line | Severity |
|-------|------|----------|
| Comment: "Auth token should be added..." | 76 | 🔴 CRITICAL - Auth not implemented |
| Pydantic error array special handling | 86-88 | 🟠 MEDIUM - coupling to backend validation format |
| `data.map(...id: crypto.randomUUID())` | 96 | 🔴 CRITICAL - Generates new UUIDs after save! |
| Different from get (line 60) | 96 vs 60 | 🔴 CRITICAL - INCONSISTENT |
| No schema validation | 85 | 🔴 CRITICAL |
| Type cast `as Error` | 111 | ⚠️ LOW - runtime could fail |

**The UUID Problem** (Line 96):
```typescript
id: crypto.randomUUID(),  // This REPLACES the ID from backend!
```

After you save, the returned data has NEW random UUIDs generated by client!
- If frontend stores reference to old ID → BUG
- If backend generates ID → don't overwrite!

---

## 5. Summary: Three Different Patterns Compared

| Aspect | Services | Staff | Settings |
|--------|----------|-------|----------|
| **Error Handling** | Custom wrapper | try-catch | try-catch + throw |
| **Type Safety** | Generic `<T>` | Type cast `as` | Type cast `:` |
| **Cache Strategy** | `cache: "no-store"` | `revalidate: 60` | `revalidate: 3600` |
| **Response Validation** | ❌ None | ❌ None | ❌ None |
| **Data Transformation** | Inline (select fields) | ❌ None | ✅ Present (time format) |
| **Return Pattern** | `{success, data, message}` | Same | Same |
| **Path Format** | `/api/v1/skills` | `/api/v1/staff` | `${BASE}/api/v1/settings/operational/` |
| **Auth Headers** | ❌ Not added | ❌ Not added | ⚠️ TODO comment |
| **Logging** | `console.error()` | `console.error()` | `console.error()` |

---

## 6. Component Integration Analysis

### How components call these actions:

**skill-form-sheet.tsx** (lines 80-103):
```typescript
async function onSubmit(data: SkillCreateForm) {
  startTransition(async () => {
    const result =
      isEdit && skill
        ? await updateSkillAction(skill.id, data)
        : await createSkillAction(data);

    if (result.success) {
      toast.success(result.message);
      onOpenChange(false);
    } else {
      toast.error(result.message);
    }
  });
}
```

**Good Pattern**: Consistent error handling in component
**Bad Pattern**: No types guarantee `result.success` exists
- What if API client is refactored to throw instead?
- Component breaks!

### Solution: Use Zod validation in component

```typescript
const ActionResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.unknown().optional(),
});

async function onSubmit(data: SkillCreateForm) {
  startTransition(async () => {
    const result = await createSkillAction(data);
    const validated = ActionResultSchema.parse(result);  // Type guard
    
    if (validated.success) {
      toast.success(validated.message);
      onOpenChange(false);
    } else {
      toast.error(validated.message);
    }
  });
}
```

---

## 7. Next.js Best Practices Check

### ✅ What's Done Correctly

1. **"use server" directive**: All files have it (line 1)
2. **revalidatePath()**: Used consistently for cache invalidation
3. **Server-side fetch**: All fetches happen in Server Actions (not client-side)
4. **Content-Type header**: Set in all requests
5. **Error handling exists**: All files have try-catch or error checks

### ❌ What's Done Incorrectly

1. **No request deduplication**: Multiple fetch() calls to same endpoint in rapid succession not deduplicated
2. **No middleware**: No request logging, no auth injection, no error transformation
3. **No API client**: Fetch repeated in multiple places
4. **No validation**: No Zod schema validation on responses
5. **Cache strategy unclear**: Why `no-store` vs `revalidate: 60` vs `revalidate: 3600`?
6. **Error types inconsistent**: 3 different patterns
7. **Auth not implemented**: Comments say "should be added"
8. **No retry logic**: Network failures not retried
9. **No request timeout**: Fetch has no timeout, could hang forever
10. **No response streaming**: All responses buffered in memory

### FSD Best Practices Check

1. **Shared API layer**: ❌ MISSING - only has `API_BASE_URL` constant
2. **Entity-based structure**: ❌ Missing - should be `shared/api/entities/skills`, `entities/staff`
3. **Adapter/Mapper pattern**: ❌ Missing - no DTO → Domain conversion
4. **Public API exports**: ❌ Missing - `shared/api/index.ts` should export all public APIs
5. **Validation schemas**: ❌ Missing - no Zod schemas for API contracts
6. **Error handling strategy**: ❌ Inconsistent - 3 patterns detected
7. **API documentation**: ❌ Missing - no JSDoc, no contract examples

---

## 8. Risk Assessment: Impact of Current Patterns

### 🔴 CRITICAL Risks (Must Fix)

1. **No centralized API client**
   - Risk: Authentication cannot be added without modifying 100+ fetch calls
   - Impact: Security hole - cannot protect API
   
2. **No request validation**
   - Risk: Backend changes response format → runtime errors
   - Impact: Fragile production code

3. **Type casts (`as`, `:`) without validation**
   - Risk: Data type mismatch at runtime
   - Impact: Silent failures, data corruption

4. **ID generation with array index (system-settings line 60)**
   - Risk: Deleting items changes IDs → broken references
   - Impact: Data loss, referential integrity violations

5. **Inconsistent error handling**
   - Risk: Same error type handled 3 different ways
   - Impact: Difficult to maintain, test coverage varies

### 🟠 MAJOR Risks (Should Fix Soon)

6. **Hardcoded endpoint paths**
   - Risk: Path changes require editing multiple files
   - Impact: Easy to miss, brittle code

7. **No schema validation**
   - Risk: Silent data type mismatches
   - Impact: Production bugs, data corruption

8. **Parallel requests without error handling**
   - Risk: Partial failures go undetected
   - Impact: Inconsistent state, data loss

### 🟡 MINOR Risks (Nice to Fix)

9. **Cache strategy unexplained**
   - Risk: Wrong cache strategy reduces performance or increases staleness
   - Impact: Poor UX

10. **No logging strategy**
    - Risk: Cannot debug production issues
    - Impact: Slow incident response

---

## 9. Correct Implementation: Phase-by-Phase

### Phase 1: Centralized API Client (Week 1)

**Create `shared/api/client.ts`:**
```typescript
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export class ApiClient {
  private baseUrl: string;
  private timeout = 30000;  // 30s timeout

  async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const error = await this.parseError(res);
        return { success: false, error };
      }

      if (res.status === 204) {
        return { success: true };
      }

      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          error: { status: 408, code: "TIMEOUT", message: "Request timeout" },
        };
      }
      return {
        success: false,
        error: { status: 500, code: "NETWORK_ERROR", message: "Network error" },
      };
    }
  }

  private async parseError(res: Response): Promise<ApiError> {
    const data = await res.json().catch(() => ({}));
    return {
      status: res.status,
      code: data.code || "UNKNOWN_ERROR",
      message: data.message || data.detail || res.statusText,
      details: data,
    };
  }

  private getAuthHeaders(): Record<string, string> {
    // Implement when auth is ready
    return {};
  }
}

export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
);
```

### Phase 2: Endpoints & Schemas (Week 2)

**Create `shared/api/endpoints/skills.ts`:**
```typescript
import { z } from "zod";
import { apiClient } from "../client";

export const SkillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().nullable(),
});

export type Skill = z.infer<typeof SkillSchema>;

export const skillsEndpoint = {
  getAll: () =>
    apiClient.fetch<Skill[]>("/api/v1/skills", {
      next: { revalidate: 0, tags: ["skills"] },
    }),

  create: (data: SkillCreateInput) =>
    apiClient.fetch<Skill>("/api/v1/skills", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: SkillUpdateInput) =>
    apiClient.fetch<Skill>(`/api/v1/skills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient.fetch(`/api/v1/skills/${id}`, {
      method: "DELETE",
    }),
};
```

### Phase 3: Action Refactoring (Week 3-4)

**Update `features/services/actions.ts`:**
```typescript
"use server";

import { skillsEndpoint } from "@/shared/api/endpoints/skills";
import { revalidatePath } from "next/cache";

export async function getSkillsAction(): Promise<Skill[]> {
  const res = await skillsEndpoint.getAll();
  if (!res.success) {
    throw new Error(res.error?.message);
  }
  return res.data || [];
}

export async function createSkillAction(data: SkillCreateInput) {
  const res = await skillsEndpoint.create(data);
  
  if (res.success) {
    revalidatePath("/dashboard/manager/services", "page");
  }
  
  return {
    success: res.success,
    message: res.success ? "Tạo kỹ năng thành công" : res.error?.message,
    data: res.data,
  };
}
```

---

## 10. Checklist: Issues to Fix

### Actions Files

- [ ] Create `shared/api/client.ts` - centralized API client
- [ ] Create `shared/api/errors.ts` - unified error types
- [ ] Create `shared/api/config.ts` - endpoint constants & cache strategies
- [ ] Create `shared/api/endpoints/` - entity-based endpoints
- [ ] Create `shared/api/schemas/` - Zod schemas for validation
- [ ] Create `shared/api/mappers/` - DTO → Domain adapters
- [ ] Move `SERVICES_PATH`, `SKILLS_PATH`, etc. to config
- [ ] Replace custom `fetchAPI()` wrapper with `apiClient.fetch()`
- [ ] Replace all try-catch patterns with consistent client usage
- [ ] Add request validation with Zod before sending
- [ ] Add response validation with Zod after receiving
- [ ] Fix system-settings ID generation (array index → UUID)
- [ ] Remove manual data transformations (use mappers instead)
- [ ] Add request timeout (30s default)
- [ ] Add request deduplication for identical concurrent requests
- [ ] Implement auth header injection in client
- [ ] Document cache strategies for each endpoint
- [ ] Add JSDoc to all action functions
- [ ] Add integration tests for API client

### Type Safety

- [ ] Remove all `as` type casts
- [ ] Remove all `:` type assertions without validation
- [ ] Use Zod `.parse()` instead of type assertions
- [ ] Define unified API response type in shared/api
- [ ] Define unified error type in shared/api

### Documentation

- [ ] Document endpoint contracts
- [ ] Document cache strategy
- [ ] Document error handling strategy
- [ ] Add examples for common operations
- [ ] Create API layer architecture diagram

---

## Summary

The current implementation has **3 different error handling patterns**, **0 validation**, **no centralized API client**, and **numerous type safety issues**. This violates FSD principles and makes scaling impossible. The fix requires creating a proper `shared/api` layer with client, endpoints, schemas, and mappers, then refactoring all actions to use them.

**Estimated effort**: 40-60 developer hours  
**Critical fixes needed**: 7 (auth, validation, errors, client, schemas, mappers, IDs)  
**Risk level**: 🔴 HIGH - Production vulnerability to auth and data corruption
