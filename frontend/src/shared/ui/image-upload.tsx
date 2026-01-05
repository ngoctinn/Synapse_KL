"use client"

import { ImagePlus, Loader2, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { createClient } from "@/shared/lib/supabase/client"
import { Button } from "@/shared/ui/button"
import Image from "next/image"

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  disabled?: boolean
  bucketName?: string
  folder?: string
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  bucketName = "service-images",
  folder = "services",
}: ImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value ?? null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setPreview(value ?? null)
  }, [value])

  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh hợp lệ")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB")
        return
      }

      try {
        setIsLoading(true)
        const supabase = createClient()

        const fileExt = file.name.split(".").pop()
        const fileName = `${folder}/${crypto.randomUUID()}.${fileExt}`

        const { error: uploadError, data } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            upsert: false,
            cacheControl: '3600'
          })

        if (uploadError) {
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName)

        onChange(publicUrl)
        setPreview(publicUrl)
        toast.success("Upload ảnh thành công")
      } catch (error) {
        console.error("Upload error:", error)
        toast.error("Có lỗi xảy ra khi upload ảnh")
      } finally {
        setIsLoading(false)
        // Reset input
        e.target.value = ""
      }
    },
    [bucketName, folder, onChange]
  )

  const onRemove = useCallback(() => {
    onChange(null)
    setPreview(null)
  }, [onChange])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative aspect-video w-40 overflow-hidden rounded-md border text-center">
            {/* Using standard img tag for simplicity within component if domain not whitelisted in next.config
                 But better use Next Image if configured. I'll use standard img for safety first or detailed Next Image usage */}
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute right-1 top-1">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={onRemove}
                disabled={disabled || isLoading}
                aria-label="Xóa ảnh"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex aspect-video w-40 items-center justify-center rounded-md border border-dashed bg-muted text-muted-foreground">
            <ImagePlus className="h-8 w-8" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isLoading}
            className="relative overflow-hidden"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải lên...
              </>
            ) : (
              <>
                <ImagePlus className="mr-2 h-4 w-4" />
                Chọn ảnh
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={onUpload}
              disabled={disabled || isLoading}
            />
          </Button>
          <p className="text-[10px] text-muted-foreground">
            Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)
          </p>
        </div>
      </div>
    </div>
  )
}
