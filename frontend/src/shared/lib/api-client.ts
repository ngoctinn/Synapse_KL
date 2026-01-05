import { createClient } from "./supabase/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"

// WHY: Internal helper để tự động đính kèm Bearer Token từ Supabase session
// NOTE: Không export - chỉ dùng nội bộ bởi fetchApi
async function fetchWithAuth(
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

  let url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`

  // FIX: Node.js 17+ prefers IPv6 for localhost, but Python/Uvicorn often listens on IPv4 only.
  // Force 127.0.0.1 to ensure connection success in Server Actions.
  if (url.includes("localhost")) {
    url = url.replace("localhost", "127.0.0.1")
  }

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
    const fullUrl = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`
    console.error(`[API Network Error] Failed to fetch: ${fullUrl}`)
    console.error(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    }
  }
}
