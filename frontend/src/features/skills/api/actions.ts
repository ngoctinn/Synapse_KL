"use server"

import { fetchApi } from "@/shared/lib/api-client"
import { Skill } from "../model/schemas"

const BASE_URL = "/skills"

export async function getSkills() {
    const result = await fetchApi<Skill[]>(BASE_URL, { method: "GET" })
    if (!result.success) {
        throw new Error(result.error)
    }
    return result.data
}
