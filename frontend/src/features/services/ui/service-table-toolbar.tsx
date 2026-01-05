"use client"

import { X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"
import { useDebouncedCallback } from "use-debounce"

import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

export function ServiceTableToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Get current params
  const currentSearch = searchParams.get("search") ?? ""
  const currentStatus = searchParams.get("isActive") ?? "all"

  // Update URL helper
  const updateUrl = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== "all") {
        params.set(key, value)
      } else {
        params.delete(key)
      }

      // Reset page when filtering
      params.delete("page")

      startTransition(() => {
        router.replace(`?${params.toString()}`)
      })
    },
    [searchParams, router]
  )

  const handleSearch = useDebouncedCallback((term: string) => {
    updateUrl("search", term)
  }, 300)

  const handleReset = () => {
    startTransition(() => {
      router.replace("/admin/services")
    })
  }

  const hasFilter = currentSearch || currentStatus !== "all"

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm dịch vụ..."
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <Select
          value={currentStatus}
          onValueChange={(value) => updateUrl("isActive", value)}
        >
          <SelectTrigger className="h-8 w-[150px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="true">Đang hoạt động</SelectItem>
            <SelectItem value="false">Tạm ngưng</SelectItem>
          </SelectContent>
        </Select>

        {hasFilter && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
