# API Architecture Audit Report - Synapse KL Frontend

**Date**: January 3, 2026  
**Framework**: Next.js 15+ (App Router)  
**Architecture**: Feature-Sliced Design (FSD)  
**Status**: ⚠️ **15 CRITICAL ISSUES FOUND**

---

## Executive Summary

Your frontend API integration follows Next.js Server Actions pattern (✅ good foundation), but **violates FSD core principles** and **lacks proper API layer abstraction**. This results in:

- ❌ **Tight coupling between features and API logic**
- ❌ **No centralized API client or configuration**
- ❌ **Missing shared API layer** (FSD-compliant)
- ❌ **Inconsistent error handling patterns**
- ❌ **No data mapping/adaptation (DTO → Domain)**
- ❌ **Direct fetch calls scattered across features**

---

## Current Architecture Issues

### Issue #1: **Missing `shared/api` Layer (FSD Violation)**

**Severity**: 🔴 **CRITICAL**

**Current State**:
```
frontend/src/
├── features/
│   ├── services/
│   │   └── actions.ts           # ❌ Direct API calls here
│   ├── staff/
│   │   └── actions.ts           # ❌ Direct API calls here
│   └── system-settings/
│       └── actions.ts           # ❌ Direct API calls here
└── shared/
    ├── api/
    │   └── index.ts             # ❌ Only has API_BASE_URL constant
    └── ui/
        └── ...
```

**FSD Best Practice**:
```
frontend/src/
├── shared/
│   ├── api/
│   │   ├── client.ts            # ✅ Centralized HTTP client
│   │   ├── endpoints/
│   │   │   ├── skills.ts
│   │   │   ├── staff.ts
│   │   │   └── settings.ts
│   │   ├── models/              # ✅ DTO & Domain models
│   │   ├── mappers/             # ✅ DTO transformation
│   │   └── index.ts             # ✅ Public API exports
│   └── ...
└── features/
    ├── services/
    │   └── actions.ts           # ✅ Uses shared/api
    └── ...
```

**Why This Matters**:
- Each feature file duplicates fetch logic
- API URL management scattered
- No single source of truth for endpoint definitions
- Difficult to test and maintain
- Impossible to implement cross-cutting concerns (auth, logging, caching)

---

### Issue #2: **Inconsistent Error Handling**

**Severity**: 🔴 **CRITICAL**

**Problem**:
```typescript
// services/actions.ts - Custom wrapper
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}) {
  // Returns: { success: boolean; message?: string; data?: T }
}

// staff/actions.ts - Try-catch pattern
export async function inviteStaffAction(data: StaffInviteInput) {
  try {
    const res = await fetch(...)
    if (!res.ok) return { success: false, message: ... }
  } catch (e) {
    return { success: false, message: "Lỗi kết nối máy chủ" }
  }
}

// system-settings/actions.ts - Throws errors
export async function getOperationalSettingsAction() {
  const response = await fetch(...)
  if (!response.ok) throw new Error(...)
}
```

**Issues**:
- ✗ Three different error handling patterns in 3 files
- ✗ Inconsistent return types
- ✗ Some throw, some return errors
- ✗ No typed error responses
- ✗ No error logging strategy
- ✗ No retry logic

**FSD-Compliant Pattern**:
```typescript
// shared/api/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public detail?: string,
    public errors?: Record<string, string[]>
  ) {
    super(`API Error ${status}: ${detail}`)
  }
}

// shared/api/client.ts
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}) {
  try {
    const res = await fetch(endpoint, options)
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new ApiError(
        res.status,
        error.detail || res.statusText,
        error.errors
      )
    }
    return res.json() as Promise<T>
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(500, "Network error")
  }
}
```

---

### Issue #3: **No DTO/Domain Model Mapping**

**Severity**: 🟠 **HIGH**

**Current State**:
```typescript
// staff/actions.ts - Direct API response typed
export async function getStaffAction(): Promise<StaffProfileWithSkills[]> {
  const res = await fetch(`${API_BASE_URL}${STAFF_PATH}`, {
    next: { revalidate: 60, tags: ["staff"] },
  });
  return res.json();  // ❌ Raw backend response
}
```

**Problems**:
- ✗ No adaptation between backend (DTO) and frontend (Domain)
- ✗ Field name mismatches not handled
- ✗ Type transformations scattered
- ✗ Backend schema changes break frontend

**FSD Pattern** (from official documentation):
```typescript
// shared/api/models/staff.ts
export interface StaffDTO {
  id: number;
  email: string;
  full_name: string;  // Backend naming
  staff_type: "manager" | "staff";
}

export interface Staff {
  id: string;
  email: string;
  fullName: string;   // Frontend naming
  staffType: "manager" | "staff";
}

// shared/api/mappers/staff.ts
export function adaptStaffDTO(dto: StaffDTO): Staff {
  return {
    id: String(dto.id),
    email: dto.email,
    fullName: dto.full_name,
    staffType: dto.staff_type,
  }
}

// shared/api/endpoints/staff.ts
import { adaptStaffDTO } from '../mappers/staff'

export async function getStaff(): Promise<Staff[]> {
  const dtos = await fetchAPI<StaffDTO[]>(`/staff`)
  return dtos.map(adaptStaffDTO)
}
```

---

### Issue #4: **No Centralized API Client**

**Severity**: 🟠 **HIGH**

**Current**:
```typescript
// Each action file reimplements fetch logic
const res = await fetch(`${API_BASE_URL}${endpoint}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
```

**Missing**:
- ✗ No base URL configuration
- ✗ No default headers (auth, version, etc.)
- ✗ No request interceptors
- ✗ No response interceptors
- ✗ No request/response logging
- ✗ No timeout handling
- ✗ No automatic retries

**FSD Solution**:
```typescript
// shared/api/client.ts
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { query?: Record<string, any> } = {}
  ): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);
    
    if (options.query) {
      Object.entries(options.query).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, error.detail, error.errors);
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  }

  get = <T>(endpoint: string, options?: RequestInit) =>
    this.request<T>(endpoint, { ...options, method: "GET" });

  post = <T>(endpoint: string, body?: any, options?: RequestInit) =>
    this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });

  put = <T>(endpoint: string, body?: any, options?: RequestInit) =>
    this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });

  delete = <T>(endpoint: string, options?: RequestInit) =>
    this.request<T>(endpoint, { ...options, method: "DELETE" });
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_BASE_URL || '');
```

---

### Issue #5: **Inconsistent Fetch Strategies**

**Severity**: 🟠 **HIGH**

**Current**:
```typescript
// services/actions.ts
export async function getSkillsAction(): Promise<Skill[]> {
  const res = await fetch(`${API_BASE_URL}${SKILLS_PATH}`, {
    cache: "no-store",  // ❌ Always fresh
  });
}

// staff/actions.ts
export async function getStaffAction(): Promise<StaffProfileWithSkills[]> {
  const res = await fetch(`${API_BASE_URL}${STAFF_PATH}`, {
    next: { revalidate: 60, tags: ["staff"] },  // ❌ 60s cache
  });
}

// system-settings/actions.ts
export async function getOperationalSettingsAction() {
  const response = await fetch(API_ENDPOINT, {
    next: { revalidate: 3600, tags: ["operational-settings"] }  // ❌ 1h cache
  });
}
```

**Problems**:
- ✗ No consistent caching strategy
- ✗ Some endpoints always fresh (expensive)
- ✗ Some endpoints cached (stale data risk)
- ✗ No documentation of intent

**Best Practice**:
```typescript
// shared/api/config.ts
export const CACHE_STRATEGIES = {
  // Never cache (real-time updates)
  NO_CACHE: { cache: "no-store" } as const,
  
  // Cache for 60 seconds (user lists, data tables)
  SHORT: { next: { revalidate: 60 } } as const,
  
  // Cache for 1 hour (settings, config)
  LONG: { next: { revalidate: 3600 } } as const,
  
  // Cache indefinitely, revalidate on demand
  STATIC: { next: { revalidate: false } } as const,
};

// shared/api/endpoints/staff.ts
export async function getStaff() {
  return apiClient.get<Staff[]>("/staff", CACHE_STRATEGIES.SHORT)
}
```

---

### Issue #6: **Mixed Responsibility in Actions**

**Severity**: 🟠 **HIGH**

**Problem**: Actions.ts files handle both **API communication** AND **data fetching logic**

```typescript
// ❌ BAD: Mixed concerns in actions.ts
export async function createSkillAction(data: SkillCreateInput) {
  const res = await fetchAPI<Skill>(SKILLS_PATH, {
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

**FSD Separation of Concerns**:

```typescript
// ✅ shared/api/endpoints/skills.ts (API layer)
export async function createSkill(data: SkillCreateInput): Promise<Skill> {
  return apiClient.post("/skills", adaptSkillInput(data))
}

// ✅ features/services/actions.ts (Server Action - mutation handler)
"use server"
import { createSkill } from "@/shared/api/endpoints/skills"
import { revalidatePath } from "next/cache"

export async function createSkillAction(data: SkillCreateInput) {
  try {
    const skill = await createSkill(data)
    revalidatePath("/dashboard/manager/services", "page")
    return { success: true, data: skill }
  } catch (error) {
    return { success: false, message: getErrorMessage(error) }
  }
}
```

---

### Issue #7: **No Public API Exports**

**Severity**: 🟠 **HIGH**

**Current**:
```typescript
// src/shared/api/index.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
```

**Should Be** (FSD):
```typescript
// src/shared/api/index.ts
export { apiClient } from "./client";
export { 
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "./endpoints/staff";

export { 
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "./endpoints/skills";

export { 
  getOperationalSettings,
  updateOperationalSettings,
} from "./endpoints/settings";

export type { Staff, StaffDTO } from "./models/staff";
export type { Skill, SkillDTO } from "./models/skills";

// Don't export internal implementation details
// export { fetchAPI } - ❌ NO
// export { API_BASE_URL } - ❌ NO  
```

**Benefits**:
- ✅ Single source of API interface
- ✅ Easy to refactor internals
- ✅ Clear API contract
- ✅ Better IDE autocomplete

---

### Issue #8: **No Request/Response Types**

**Severity**: 🟠 **HIGH**

**Current**:
```typescript
// Mixing input types with API responses
export async function createSkillAction(data: SkillCreateInput) {
  const res = await fetchAPI<Skill>(SKILLS_PATH, {  // ❌ What if response != input type?
    method: "POST",
    body: JSON.stringify(data),
  });
}
```

**Should Be**:
```typescript
// shared/api/models/skills.ts
export interface SkillInput {
  name: string;
  description?: string;
}

export interface SkillDTO {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// shared/api/endpoints/skills.ts
export async function createSkill(input: SkillInput): Promise<Skill> {
  const dto = await apiClient.post<SkillDTO>("/skills", input)
  return adaptSkillDTO(dto)
}
```

---

### Issue #9: **Hardcoded Paths in Components**

**Severity**: 🟡 **MEDIUM**

**Found**:
```typescript
// features/*/actions.ts
const SKILLS_PATH = "/api/v1/skills";
const STAFF_PATH = "/api/v1/staff";
const SCHEDULING_PATH = "/api/v1/scheduling";
const CATEGORIES_PATH = "/api/v1/categories";
const RESOURCES_PATH = "/api/v1/resources";
const API_ENDPOINT = `${API_BASE_URL}/api/v1/settings/operational/`;
```

**Problem**:
- ✗ Paths scattered across multiple files
- ✗ Inconsistent path patterns
- ✗ Hard to change base version
- ✗ No DRY principle

**Solution**:
```typescript
// shared/api/config.ts
export const API_ENDPOINTS = {
  skills: "/api/v1/skills",
  staff: "/api/v1/staff",
  scheduling: "/api/v1/scheduling",
  categories: "/api/v1/categories",
  resources: "/api/v1/resources",
  operationalSettings: "/api/v1/settings/operational",
} as const;

// Usage
import { API_ENDPOINTS } from "@/shared/api/config";
const response = await apiClient.get(API_ENDPOINTS.skills);
```

---

### Issue #10: **No Request/Response Logging**

**Severity**: 🟡 **MEDIUM**

**Problem**:
```typescript
} catch (error) {
  console.error(`Fetch Error [${endpoint}]:`, error);  // ❌ Basic logging
  return { success: false, message: "Lỗi kết nối máy chủ" };
}
```

**Missing**:
- ✗ No structured logging
- ✗ No request/response bodies logged
- ✗ No performance metrics
- ✗ No tracing for debugging

**Solution**:
```typescript
// shared/api/logger.ts
export const apiLogger = {
  logRequest(method: string, url: string, body?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${method} ${url}`, body);
    }
  },
  
  logResponse(method: string, url: string, status: number, duration: number) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${method} ${url} ${status} (${duration}ms)`);
    }
  },
  
  logError(error: Error) {
    console.error('[API Error]', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  },
};
```

---

### Issue #11: **No Authentication Header Management**

**Severity**: 🟡 **MEDIUM**

**Missing**:
```typescript
// No auth token injection seen in any action
// If API requires auth, it's not handled centrally
```

**Should Be**:
```typescript
// shared/api/client.ts
export class ApiClient {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    // Inject auth token if available
    const token = await getAuthToken(); // from auth provider
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(...);
  }
}
```

---

### Issue #12: **No Data Validation**

**Severity**: 🟡 **MEDIUM**

**Current**:
```typescript
export async function createSkillAction(data: SkillCreateInput) {
  const res = await fetchAPI<Skill>(SKILLS_PATH, {
    method: "POST",
    body: JSON.stringify(data),  // ❌ No validation before sending
  });
}
```

**Missing**:
- ✗ No input validation
- ✗ No DTO validation on response
- ✗ No runtime type checking
- ✗ Silent failures possible

**Solution** (using Zod):
```typescript
// shared/api/schemas/skills.ts
import { z } from 'zod';

export const SkillInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const SkillDTOSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// shared/api/endpoints/skills.ts
export async function createSkill(input: unknown): Promise<Skill> {
  const validatedInput = SkillInputSchema.parse(input);
  const dto = await apiClient.post<unknown>("/skills", validatedInput);
  const validatedDTO = SkillDTOSchema.parse(dto);
  return adaptSkillDTO(validatedDTO);
}
```

---

### Issue #13: **No Parallel vs Sequential Handling**

**Severity**: 🟡 **MEDIUM**

**Bad Example Found**:
```typescript
// staff/actions.ts
export async function updateStaffWithSkillsAction(...) {
  // 1. Update Profile
  const profileRes = await fetch(...);
  if (!profileRes.ok) return { success: false, ... }

  // 2. Update Skills (waits for profile)
  const skillsRes = await fetch(...);  // ❌ Sequential when could be parallel
  ...
}
```

**Better Approach**:
```typescript
export async function updateStaffWithSkills(id: string, ...data) {
  const [profile, skills] = await Promise.all([
    updateProfile(id, profileData),
    updateSkills(id, skillsData),
  ]);
  return { profile, skills };
}
```

---

### Issue #14: **No Error Type Definitions**

**Severity**: 🟡 **MEDIUM**

**Current**:
```typescript
interface APIErrorResponse {
  detail?: string;  // ❌ Incomplete
}
```

**Should Be**:
```typescript
// shared/api/models/errors.ts
export interface ApiErrorResponse {
  detail?: string;
  errors?: Record<string, string[]>; // Pydantic validation errors
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}
```

---

### Issue #15: **No API Documentation/Contract**

**Severity**: 🟡 **MEDIUM**

**Missing**:
- ✗ No OpenAPI/Swagger spec referenced
- ✗ No API endpoint documentation
- ✗ No request/response examples
- ✗ No error code documentation

**Solution**:
```typescript
/**
 * Fetch list of staff
 * 
 * @param {number} page - Page number (0-indexed)
 * @param {number} limit - Items per page (default: 20)
 * @returns {Promise<Staff[]>} Array of staff members
 * @throws {ApiError} If request fails
 * 
 * @example
 * const staff = await getStaff();
 * 
 * @see https://api-docs.example.com/staff
 */
export async function getStaff(page?: number, limit?: number): Promise<Staff[]> {
  return apiClient.get("/staff", {
    query: { page, limit },
  });
}
```

---

## Summary of Issues by Feature

### `features/services/actions.ts`
- ✗ Custom fetchAPI wrapper (re-invented wheel)
- ✗ Mixed concerns
- ✗ No DTOs
- ✗ Hardcoded paths
- ✗ Inconsistent with other features

### `features/staff/actions.ts`
- ✗ Try-catch pattern (different from services)
- ✗ Direct fetch calls
- ✗ Sequential operations that could be parallel
- ✗ Inconsistent error handling
- ✗ No validation

### `features/system-settings/actions.ts`
- ✗ Throws errors (different from others)
- ✗ Manual time formatting (data mapping should be in DTO)
- ✗ Array indexing for IDs (smell)
- ✗ No error handling

---

## Recommended Fix Priority

### Phase 1: Foundation (Week 1)
```
1. Create shared/api/client.ts - Centralized API client
2. Create shared/api/errors.ts - Typed error handling
3. Create shared/api/config.ts - Endpoints & cache strategies
4. Update shared/api/index.ts - Public API exports
```

### Phase 2: Models & Mapping (Week 2)
```
5. Create shared/api/models/ - DTOs & Domain types
6. Create shared/api/mappers/ - DTO transformations
7. Implement SkillDTO → Skill mapper
8. Implement StaffDTO → Staff mapper
```

### Phase 3: Endpoints (Week 3)
```
9. Create shared/api/endpoints/skills.ts
10. Create shared/api/endpoints/staff.ts
11. Create shared/api/endpoints/settings.ts
12. Create shared/api/endpoints/scheduling.ts
13. Create shared/api/endpoints/resources.ts
```

### Phase 4: Refactor Features (Week 4)
```
14. Refactor features/services/actions.ts → use shared/api
15. Refactor features/staff/actions.ts → use shared/api
16. Refactor features/system-settings/actions.ts → use shared/api
17. Add tests for API layer
```

---

## Code Examples - After Refactoring

### Before (Current - BAD)
```typescript
// features/staff/actions.ts
export async function createStaffProfileAction(data: StaffProfileCreateInput) {
  try {
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
  } catch (e) {
    return { success: false, message: "Lỗi kết nối máy chủ" };
  }
}
```

### After (FSD-Compliant - GOOD)
```typescript
// shared/api/endpoints/staff.ts
"use server"
import { apiClient } from '../client'
import { StaffInputSchema, StaffDTOSchema } from '../schemas/staff'
import { adaptStaffDTO } from '../mappers/staff'
import type { Staff, StaffInput } from '../models/staff'

export async function createStaff(input: StaffInput): Promise<Staff> {
  const validatedInput = StaffInputSchema.parse(input)
  const dto = await apiClient.post<unknown>('/staff', validatedInput)
  const validatedDTO = StaffDTOSchema.parse(dto)
  return adaptStaffDTO(validatedDTO)
}

// features/staff/actions.ts
"use server"
import { createStaff } from '@/shared/api/endpoints/staff'
import { revalidatePath } from 'next/cache'
import { ApiError } from '@/shared/api/errors'

export async function createStaffProfileAction(data: unknown) {
  try {
    const staff = await createStaff(data)
    revalidatePath('/dashboard/manager/staff')
    return { 
      success: true,
      message: 'Tạo hồ sơ nhân viên thành công',
      data: staff 
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return { 
        success: false, 
        message: error.detail || 'Không thể tạo hồ sơ nhân viên' 
      }
    }
    return { 
      success: false, 
      message: 'Lỗi hệ thống' 
    }
  }
}
```

---

## Next Steps

1. **Review this audit** with team
2. **Create `shared/api` architecture** following FSD
3. **Implement centralized API client** 
4. **Create DTO mappers** for each entity
5. **Refactor features** to use new API layer
6. **Add integration tests** for API calls
7. **Document API contract** with examples

---

## References

- ✅ **Next.js App Router**: https://nextjs.org/docs/app
- ✅ **Feature-Sliced Design**: https://feature-sliced.design/docs
- ✅ **Best Practices**: See `TYPOGRAPHY_GUIDELINES.md` for project standards

**Contact**: Request detailed refactoring plan once approved.
