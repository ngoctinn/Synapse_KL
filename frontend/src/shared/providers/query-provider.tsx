"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as React from "react"

/**
 * WHY: Cung cấp QueryClient cho toàn bộ ứng dụng.
 * Hỗ trợ caching và quản lý trạng thái dữ liệu từ API.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // WHY: Tránh refetch quá nhiều lần trong môi trường dev
            staleTime: 60 * 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
