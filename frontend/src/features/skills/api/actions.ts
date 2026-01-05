"use server"

import { fetchApi } from "@/shared/lib/api-client"
import { revalidatePath } from "next/cache"
import { Skill } from "../model/schemas"

const BASE_URL = "/skills"

export async function getSkills() {
    const result = await fetchApi<Skill[]>(BASE_URL, {
        method: "GET",
        next: { tags: ["skills"] } // WHY: Support revalidation
    })
    if (!result.success) {
        throw new Error(result.error)
    }
    return result.data
}

export async function getSkill(id: string) {
    const result = await fetchApi<Skill>(`${BASE_URL}/${id}`, { method: "GET" })
    if (!result.success) {
        throw new Error(result.error)
    }
    return result.data
}

export async function createSkill(data: any) {
    const result = await fetchApi<Skill>(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
    })

    if (result.success) {
        revalidatePath("/admin/skills")
    }

    return result
}

export async function updateSkill(id: string, data: any) {
    const result = await fetchApi<Skill>(`${BASE_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    })

    if (result.success) {
        revalidatePath("/admin/skills")
    }

    return result
}

export async function deleteSkill(id: string) {
    const result = await fetchApi(`${BASE_URL}/${id}`, {
        method: "DELETE",
    })

    if (result.success) {
        revalidatePath("/admin/skills")
    }

    return result
}
