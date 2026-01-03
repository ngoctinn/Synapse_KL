# FSD Best Practices: API Layer Architecture

## 1. What is FSD (Feature-Sliced Design)?

Feature-Sliced Design is a strict architectural methodology that organizes frontend code into **layered slices** where each slice represents a feature. The standard layer structure is:

```
app/          - Global setup, providers, root layout
pages/        - Page-level components
widgets/      - Complex UI compositions (dashboard layouts)
features/     - User-facing features (auth, profile, services)
entities/     - Business domain entities (user, product, order)
shared/       - Reusable utilities, ui components, helpers
```

The key principle: **"Entities know nothing about features"** and **"Features know nothing about pages"**

---

## 2. Current Violation: Missing Shared API Layer

### What's Currently Happening

```
frontend/
├── features/
│   ├── services/
│   │   ├── actions.ts          ← API call logic HERE (❌ WRONG PLACE)
│   │   ├── components/
│   │   ├── types.ts
│   │   └── schemas.ts
│   ├── staff/
│   │   ├── actions.ts          ← API call logic HERE (❌ WRONG PLACE)
│   │   ├── components/
│   │   ├── types.ts
│   │   └── schemas.ts
│   └── system-settings/
│       ├── actions.ts          ← API call logic HERE (❌ WRONG PLACE)
│       ├── components/
│       ├── types.ts
│       └── schemas.ts
└── shared/
    └── api/
        └── index.ts            ← ONLY has API_BASE_URL constant (❌ NOT A REAL API LAYER)
```

### FSD Correct Structure

```
frontend/
├── features/
│   ├── services/
│   │   ├── api/                     ← NO API LAYER IN FEATURES
│   │   ├── actions.ts               ← NO fetch() CALLS HERE
│   │   │   └── calls shared/api endpoints
│   │   ├── components/
│   │   ├── types.ts                 ← Domain types ONLY
│   │   └── schemas.ts
│   ├── staff/
│   │   ├── actions.ts
│   │   │   └── calls shared/api endpoints
│   │   ├── components/
│   │   ├── types.ts
│   │   └── schemas.ts
│   └── system-settings/
│       ├── actions.ts
│       │   └── calls shared/api endpoints
│       ├── components/
│       ├── types.ts
│       └── schemas.ts
└── shared/
    ├── api/                         ← ✅ REAL API LAYER
    │   ├── client.ts                ← API client (fetch wrapper)
    │   ├── errors.ts                ← Error types & handlers
    │   ├── config.ts                ← Endpoints & cache strategies
    │   ├── schemas/                 ← Zod validation schemas
    │   │   ├── skills.ts
    │   │   ├── staff.ts
    │   │   ├── services.ts
    │   │   └── settings.ts
    │   ├── entities/                ← DTO & domain types
    │   │   ├── skill.ts
    │   │   ├── staff.ts
    │   │   ├── service.ts
    │   │   └── settings.ts
    │   ├── mappers/                 ← Adapters: DTO → Domain
    │   │   ├── skill.ts
    │   │   ├── staff.ts
    │   │   ├── service.ts
    │   │   └── settings.ts
    │   ├── endpoints/               ← Entity-based API operations
    │   │   ├── skills.ts            ← getSkills, createSkill, etc.
    │   │   ├── staff.ts             ← getStaff, inviteStaff, etc.
    │   │   ├── services.ts          ← getServices, createService, etc.
    │   │   └── settings.ts          ← getSettings, updateSettings, etc.
    │   └── index.ts                 ← PUBLIC API exports
    ├── components/
    ├── hooks/
    ├── lib/
    ├── providers/
    ├── types/
    └── ui/
```

---

## 3. Detailed Breakdown of Each Layer

### Layer 1: Shared API Client (`shared/api/client.ts`)

**Responsibility**: Single HTTP client with centralized error handling and auth

```typescript
// shared/api/client.ts

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
  private timeout = 30000;
  private pendingRequests = new Map<string, Promise<Response>>();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Request deduplication
    const key = this.getRequestKey(endpoint, options);
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = this.executeRequest<T>(endpoint, options)
      .finally(() => this.pendingRequests.delete(key));

    this.pendingRequests.set(key, promise);
    return promise;
  }

  private async executeRequest<T>(
    endpoint: string,
    options: RequestInit
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
      return this.handleError(error);
    }
  }

  private async parseError(res: Response): Promise<ApiError> {
    const data = await res.json().catch(() => ({}));
    return {
      status: res.status,
      code: data.code || "UNKNOWN",
      message: data.message || data.detail || res.statusText,
      details: data,
    };
  }

  private handleError(error: unknown): ApiResponse {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          success: false,
          error: { status: 408, code: "TIMEOUT", message: "Request timeout" },
        };
      }
      return {
        success: false,
        error: { status: 500, code: "NETWORK_ERROR", message: error.message },
      };
    }
    return {
      success: false,
      error: { status: 500, code: "UNKNOWN", message: "Unknown error" },
    };
  }

  private getAuthHeaders(): Record<string, string> {
    // Get from session when auth implemented
    const token = this.getSessionToken();
    if (!token) return {};
    return { "Authorization": `Bearer ${token}` };
  }

  private getSessionToken(): string | null {
    // Implement when auth is ready
    return null;
  }

  private getRequestKey(endpoint: string, options: RequestInit): string {
    const method = options.method || "GET";
    return `${method}:${endpoint}`;
  }
}

export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
);
```

**Benefits of Centralized Client**:
1. ✅ Auth headers added in ONE place
2. ✅ Timeout handling in ONE place  
3. ✅ Error handling in ONE place
4. ✅ Request deduplication in ONE place
5. ✅ Logging in ONE place
6. ✅ Retry logic in ONE place
7. ✅ Easy to mock for testing

---

### Layer 2: Configuration (`shared/api/config.ts`)

**Responsibility**: Centralized endpoint URLs and cache strategies

```typescript
// shared/api/config.ts

export const API_ENDPOINTS = {
  // Skills
  SKILLS: "/api/v1/skills",
  
  // Categories
  CATEGORIES: "/api/v1/categories",
  
  // Resources
  RESOURCES: "/api/v1/resources",
  RESOURCE_GROUPS: "/api/v1/resources/groups",
  
  // Services
  SERVICES: "/api/v1/services",
  
  // Staff
  STAFF: "/api/v1/staff",
  STAFF_INVITE: "/api/v1/staff/invite",
  STAFF_SKILLS: "/api/v1/staff/:id/skills",
  
  // Scheduling
  SHIFTS: "/api/v1/scheduling/shifts",
  SCHEDULES: "/api/v1/scheduling/schedules",
  
  // Settings
  SETTINGS: "/api/v1/settings/operational",
} as const;

export const CACHE_STRATEGIES = {
  // Skills change frequently (new skill added)
  SKILLS: { revalidate: 0, tags: ["skills"] } as const,
  
  // Staff changes occasionally
  STAFF: { revalidate: 60, tags: ["staff"] } as const,
  
  // Settings rarely change
  SETTINGS: { revalidate: 3600, tags: ["settings"] } as const,
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  UNKNOWN: "UNKNOWN",
} as const;
```

**Benefits**:
1. ✅ Single source of truth for endpoints
2. ✅ Cache strategies documented
3. ✅ Easy to find what endpoints exist
4. ✅ Easy to change endpoint base path

---

### Layer 3: Schemas (`shared/api/schemas/skills.ts`)

**Responsibility**: Zod schemas for runtime validation

```typescript
// shared/api/schemas/skills.ts

import { z } from "zod";

// DTO from backend
export const SkillDTOSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type SkillDTO = z.infer<typeof SkillDTOSchema>;

// Request validation
export const SkillCreateInputSchema = z.object({
  name: z.string().min(1, "Name required").max(100),
  code: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
});

export type SkillCreateInput = z.infer<typeof SkillCreateInputSchema>;

export const SkillUpdateInputSchema = SkillCreateInputSchema.partial();

export type SkillUpdateInput = z.infer<typeof SkillUpdateInputSchema>;

// List response
export const SkillListResponseSchema = z.object({
  data: z.array(SkillDTOSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type SkillListResponse = z.infer<typeof SkillListResponseSchema>;

// Single response
export const SkillResponseSchema = SkillDTOSchema;

export type SkillResponse = z.infer<typeof SkillResponseSchema>;
```

**Benefits**:
1. ✅ Runtime validation catches backend changes
2. ✅ Type safety guaranteed
3. ✅ Single source of truth for API contracts
4. ✅ Auto-generates TypeScript types

---

### Layer 4: Mappers (`shared/api/mappers/skills.ts`)

**Responsibility**: Transform DTO → Domain model

```typescript
// shared/api/mappers/skills.ts

import type { SkillDTO } from "../schemas/skills";
import type { Skill } from "../entities/skill";

export function adaptSkillDTO(dto: SkillDTO): Skill {
  return {
    id: dto.id,
    name: dto.name,
    code: dto.code,
    description: dto.description ?? "",
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}

export function adaptSkillListDTO(dtos: SkillDTO[]): Skill[] {
  return dtos.map(adaptSkillDTO);
}
```

**Why Mappers?**
1. **Separation of Concerns**: API contract ≠ Domain model
2. **Flexibility**: If backend changes, only mappers change
3. **Business Logic**: Can add transformations here (e.g., date formatting)
4. **Type Safety**: Ensures all fields transformed

---

### Layer 5: Entities (`shared/api/entities/skill.ts`)

**Responsibility**: Domain model (the "truth" in your app)

```typescript
// shared/api/entities/skill.ts

/**
 * Skill domain model
 * This is what your components should work with, not the DTO
 */
export interface Skill {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * For creating skills
 */
export interface SkillCreatePayload {
  name: string;
  code: string;
  description?: string;
}

/**
 * For updating skills
 */
export interface SkillUpdatePayload {
  name?: string;
  code?: string;
  description?: string;
}
```

**Key Difference from DTO**:
- **DTO** (Data Transfer Object): What backend sends (`string` dates, `snake_case`)
- **Entity** (Domain Model): What your app uses (`Date` objects, `camelCase`)

Example:
```typescript
// Backend sends (DTO)
{
  id: "123",
  name: "Massage Thai",
  code: "MASSAGE_THAI",
  description: null,
  created_at: "2024-01-01T10:00:00Z",
  updated_at: "2024-01-03T15:30:00Z"
}

// Your app uses (Entity)
{
  id: "123",
  name: "Massage Thai",
  code: "MASSAGE_THAI",
  description: "",
  createdAt: Date(2024-01-01T10:00:00Z),
  updatedAt: Date(2024-01-03T15:30:00Z)
}
```

---

### Layer 6: Endpoints (`shared/api/endpoints/skills.ts`)

**Responsibility**: Entity-based API operations

```typescript
// shared/api/endpoints/skills.ts

"use server";

import { apiClient } from "../client";
import { API_ENDPOINTS, CACHE_STRATEGIES } from "../config";
import { adaptSkillDTO, adaptSkillListDTO } from "../mappers/skills";
import { 
  SkillDTOSchema, 
  SkillListResponseSchema,
  SkillCreateInputSchema,
  SkillUpdateInputSchema,
} from "../schemas/skills";
import type { Skill, SkillCreatePayload, SkillUpdatePayload } from "../entities/skill";

/**
 * Skills API Endpoint Collection
 * All skill-related API operations
 */
export const skillsEndpoint = {
  /**
   * Get all skills
   * @returns Array of skills
   */
  async getAll(): Promise<{ success: boolean; data?: Skill[]; error?: string }> {
    const res = await apiClient.fetch<unknown>(API_ENDPOINTS.SKILLS, {
      ...CACHE_STRATEGIES.SKILLS,
    });

    if (!res.success) {
      return { success: false, error: res.error?.message };
    }

    // Validate response
    const validated = SkillListResponseSchema.parse(res.data);
    const adapted = adaptSkillListDTO(validated.data);

    return { success: true, data: adapted };
  },

  /**
   * Get single skill by ID
   */
  async getById(id: string): Promise<{ success: boolean; data?: Skill; error?: string }> {
    const res = await apiClient.fetch<unknown>(`${API_ENDPOINTS.SKILLS}/${id}`, {
      ...CACHE_STRATEGIES.SKILLS,
    });

    if (!res.success) {
      return { success: false, error: res.error?.message };
    }

    const validated = SkillDTOSchema.parse(res.data);
    const adapted = adaptSkillDTO(validated);

    return { success: true, data: adapted };
  },

  /**
   * Create a new skill
   */
  async create(payload: SkillCreatePayload): Promise<{ success: boolean; data?: Skill; error?: string }> {
    // Validate input
    const validated = SkillCreateInputSchema.parse(payload);

    const res = await apiClient.fetch<unknown>(API_ENDPOINTS.SKILLS, {
      method: "POST",
      body: JSON.stringify(validated),
    });

    if (!res.success) {
      return { success: false, error: res.error?.message };
    }

    const dto = SkillDTOSchema.parse(res.data);
    const adapted = adaptSkillDTO(dto);

    return { success: true, data: adapted };
  },

  /**
   * Update existing skill
   */
  async update(id: string, payload: SkillUpdatePayload): Promise<{ success: boolean; data?: Skill; error?: string }> {
    const validated = SkillUpdateInputSchema.parse(payload);

    const res = await apiClient.fetch<unknown>(`${API_ENDPOINTS.SKILLS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(validated),
    });

    if (!res.success) {
      return { success: false, error: res.error?.message };
    }

    const dto = SkillDTOSchema.parse(res.data);
    const adapted = adaptSkillDTO(dto);

    return { success: true, data: adapted };
  },

  /**
   * Delete skill
   */
  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    const res = await apiClient.fetch(`${API_ENDPOINTS.SKILLS}/${id}`, {
      method: "DELETE",
    });

    return {
      success: res.success,
      error: res.error?.message,
    };
  },
};
```

**Benefits**:
1. ✅ All skill operations in ONE file
2. ✅ Consistent return type
3. ✅ Input/output validated
4. ✅ Mappers applied automatically
5. ✅ Documented with JSDoc

---

### Layer 7: Public API (`shared/api/index.ts`)

**Responsibility**: Export public API surface

```typescript
// shared/api/index.ts

// Client
export { apiClient, type ApiResponse, type ApiError } from "./client";

// Configuration
export { API_ENDPOINTS, CACHE_STRATEGIES, ERROR_CODES } from "./config";

// Entities (domain models)
export type { Skill } from "./entities/skill";
export type { Staff, StaffProfile } from "./entities/staff";
export type { Service } from "./entities/service";
export type { OperationalSettings } from "./entities/settings";

// Endpoints (operations)
export { skillsEndpoint } from "./endpoints/skills";
export { staffEndpoint } from "./endpoints/staff";
export { servicesEndpoint } from "./endpoints/services";
export { settingsEndpoint } from "./endpoints/settings";

// Error utilities
export { createApiError, isApiError } from "./errors";
```

---

## 4. How to Use This API Layer

### In Server Action

```typescript
// features/services/actions.ts

"use server";

import { skillsEndpoint } from "@/shared/api";
import { revalidatePath } from "next/cache";

export async function createSkillAction(data: SkillCreateInput) {
  const res = await skillsEndpoint.create(data);
  
  if (res.success) {
    revalidatePath("/dashboard/manager/services", "page");
  }
  
  return {
    success: res.success,
    message: res.success ? "Tạo kỹ năng thành công" : res.error,
    data: res.data,
  };
}
```

### In Client Component

```typescript
"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { createSkillAction } from "../actions";

export function SkillForm() {
  const [isPending, startTransition] = useTransition();

  async function onSubmit(data: SkillCreateInput) {
    startTransition(async () => {
      const result = await createSkillAction(data);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  // ...
}
```

---

## 5. Key Principles of FSD API Layer

### Principle 1: Separation of Concerns

```
❌ WRONG: API call mixed with business logic
export async function updateStaffWithSkillsAction(id: string, ...) {
  // 1. fetch staff
  // 2. fetch skills
  // 3. validate data
  // 4. revalidate cache
  // All mixed together!
}

✅ CORRECT: API layer handles fetching, action handles coordination
export async function updateStaffWithSkillsAction(id: string, ...) {
  const [staffRes, skillsRes] = await Promise.all([
    staffEndpoint.update(id, profileData),
    skillsEndpoint.update(id, skillData),
  ]);
  
  if (staffRes.success && skillsRes.success) {
    revalidatePath("/dashboard/manager/staff");
  }
  
  return { success: ..., data: ... };
}
```

### Principle 2: Single Responsibility

```
❌ WRONG: Client does everything
// shared/api/client.ts - 500 lines
export class ApiClient {
  // HTTP
  // Error handling
  // Auth headers
  // Caching
  // Validation
  // Transformation
  // Logging
}

✅ CORRECT: Client is just HTTP, others handle specialization
// shared/api/client.ts - focused on HTTP
export class ApiClient {
  fetch<T>(endpoint, options) { ... }
}

// Each endpoint handles its own validation/transformation
export const skillsEndpoint = {
  create: async (data) => {
    const validated = validate(data);
    const res = await apiClient.fetch(...);
    return adapt(res);
  }
}
```

### Principle 3: No Cross-Feature API Imports

```
❌ WRONG: Feature imports from another feature's API
// features/services/actions.ts
import { staffEndpoint } from "@/features/staff/api";  // NOT ALLOWED

✅ CORRECT: All go through shared/api
// features/services/actions.ts
import { staffEndpoint } from "@/shared/api";

// This way services feature is independent
```

### Principle 4: DTO ≠ Domain

```
❌ WRONG: Using API response directly
const skill = await fetch(...);
return skill;  // DTO exposed to app!

✅ CORRECT: Adapt to domain model
const skillDTO = await fetch(...);
const skill = adaptSkillDTO(skillDTO);  // Entity returned
return skill;
```

---

## 6. Migration Path: Current → FSD

### Step 1: Create `shared/api/client.ts`
- Move fetch logic here
- Add timeout, error handling, auth

### Step 2: Create `shared/api/config.ts`
- Extract all endpoint constants
- Define cache strategies

### Step 3: Create `shared/api/schemas/`
- Add Zod schemas for each entity
- Validate requests and responses

### Step 4: Create `shared/api/entities/`
- Define domain models
- Separate from DTOs

### Step 5: Create `shared/api/mappers/`
- DTO → Domain transformations
- Applied in endpoints

### Step 6: Create `shared/api/endpoints/`
- One file per entity
- Uses client, schemas, mappers
- Single source of truth for entity operations

### Step 7: Refactor features
- Import from `shared/api/endpoints`
- Remove fetch logic
- Use returned domain entities

### Step 8: Update public API
- Export from `shared/api/index.ts`
- Hide internal structure

---

## 7. Testing Benefits

With FSD API layer, testing becomes trivial:

```typescript
// Test file
import { describe, it, expect, vi } from "vitest";
import { skillsEndpoint } from "@/shared/api";
import { createSkillAction } from "@/features/services/actions";

vi.mock("@/shared/api", () => ({
  skillsEndpoint: {
    create: vi.fn(),
  },
}));

describe("createSkillAction", () => {
  it("should create skill successfully", async () => {
    vi.mocked(skillsEndpoint.create).mockResolvedValue({
      success: true,
      data: { id: "123", name: "Test" },
    });

    const result = await createSkillAction({ name: "Test", code: "TEST" });

    expect(result.success).toBe(true);
    expect(result.data.name).toBe("Test");
  });

  it("should handle creation error", async () => {
    vi.mocked(skillsEndpoint.create).mockResolvedValue({
      success: false,
      error: "Validation failed",
    });

    const result = await createSkillAction({ name: "", code: "" });

    expect(result.success).toBe(false);
  });
});
```

---

## Summary

**Current State**: ❌ API logic scattered across features
**FSD Goal**: ✅ Centralized, validated, documented API layer

**Benefits**:
1. Auth can be added in 1 hour (not 2 days)
2. Cache strategy is documented and consistent
3. Validation catches backend changes at runtime
4. Type safety 100%
5. Easy to test
6. Easy to maintain
7. Easy to add new features (copy endpoint template)
8. All developers know where to find API code

**Estimated Effort**: 40-60 hours
**Maintenance Saving**: 30+ hours per year
