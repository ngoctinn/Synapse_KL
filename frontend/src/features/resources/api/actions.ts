"use server"

import { fetchApi } from "@/shared/lib/api-client"
import { revalidatePath } from "next/cache"
import type {
    ResourceFormValues,
    ResourceGroup,
    ResourceGroupFormValues,
    ResourceItem,
} from "../model/schemas"

const BASE_URL = "/api/v1/resources"

// === Resource Groups ===

export async function getResourceGroups() {
  const result = await fetchApi<ResourceGroup[]>(`${BASE_URL}/groups`)

  if (!result.success) {
    return { success: false as const, error: result.error }
  }

  return { success: true as const, data: result.data }
}

export async function createResourceGroup(data: ResourceGroupFormValues) {
  const result = await fetchApi<ResourceGroup>(`${BASE_URL}/groups`, {
    method: "POST",
    body: JSON.stringify(data),
  })

  if (!result.success) {
    return { success: false as const, error: result.error }
  }

  revalidatePath("/admin/resources")
  return { success: true as const, data: result.data }
}

export async function updateResourceGroup(id: string, data: ResourceGroupFormValues) {
  const result = await fetchApi<ResourceGroup>(`${BASE_URL}/groups/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })

  if (!result.success) {
    return { success: false as const, error: result.error }
  }

  revalidatePath("/admin/resources")
  return { success: true as const, data: result.data }
}

export async function deleteResourceGroup(id: string) {
  const result = await fetchApi<void>(`${BASE_URL}/groups/${id}`, {
    method: "DELETE",
  })

  if (!result.success) {
    return { success: false as const, error: result.error }
  }

  revalidatePath("/admin/resources")
  return { success: true as const }
}

// === Resources ===

export async function getResources(groupId?: string) {
  const url = groupId
    ? `${BASE_URL}?group_id=${groupId}`
    : BASE_URL

  const result = await fetchApi<ResourceItem[]>(url)

  if (!result.success) {
    return { success: false as const, error: result.error }
  }

  return { success: true as const, data: result.data }
}

export async function createResource(data: ResourceFormValues) {
  const result = await fetchApi<ResourceItem>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(data),
  })

  if (!result.success) {
    return { success: false as const, error: result.error }
  }

  revalidatePath("/admin/resources")
  return { success: true as const, data: result.data }
}

export async function updateResource(id: string, data: ResourceFormValues) {
  const result = await fetchApi<ResourceItem>(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })

  if (!result.success) {
    return { success: false as const, error: result.error }
  }

  revalidatePath("/admin/resources")
  return { success: true as const, data: result.data }
}

export async function deleteResource(id: string) {
  const result = await fetchApi<void>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  })

  if (!result.success) {
    return { success: false as const, error: result.error }
  }

  revalidatePath("/admin/resources")
  return { success: true as const }
}
