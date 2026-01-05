"use server"

import { fetchApi } from "@/shared/lib/api-client"

const BASE_URL = "/api/v1/categories"

export interface Category {
    id: string
    name: string
    description?: string
    sortOrder: number
}

interface BackendCategory {
    id: string
    name: string
    description?: string
    sort_order: number
}

function transformCategory(data: BackendCategory): Category {
    return {
        id: data.id,
        name: data.name,
        description: data.description,
        sortOrder: data.sort_order,
    }
}

export async function getCategories(): Promise<Category[]> {
    const result = await fetchApi<BackendCategory[]>(BASE_URL, { method: "GET" })
    if (!result.success) {
        throw new Error(result.error)
    }
    return result.data.map(transformCategory)
}
