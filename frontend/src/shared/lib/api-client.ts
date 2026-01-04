import { createClient } from "./supabase/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// WHY: Wrapper để tự động đính kèm Bearer Token từ Supabase session
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`)
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`

  return fetch(url, {
    ...options,
    headers,
    cache: options.cache ?? "no-store", // WHY: Default no-store cho dynamic data
  })
}

// WHY: Helper cho response có cấu trúc chuẩn
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const response = await fetchWithAuth(endpoint, options)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = typeof errorData.detail === "string"
        ? errorData.detail
        : JSON.stringify(errorData.detail || `HTTP ${response.status}`)

      console.error("[API Error]", endpoint, errorMessage) // Log to server console

      return {
        success: false,
        error: errorMessage,
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    }
  }
}
