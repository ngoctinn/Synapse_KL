"use client";

import { supabase } from "@/shared/lib/supabase";
import { cn } from "@/shared/lib/utils"; // Giả định path này đúng
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "./button";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  className?: string;
  bucket?: string;
}

export function ImageUpload({
  value,
  onChange,
  className,
  bucket = "service-images",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  // Extract file path from Public URL
  const getFilePathFromUrl = (url: string) => {
    const parts = url.split(`${bucket}/`);
    return parts.length > 1 ? parts[1] : null;
  };

  const deleteImage = async (url: string) => {
    const filePath = getFilePathFromUrl(url);
    if (!filePath) return;

    try {
      await supabase.storage.from(bucket).remove([filePath]);
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file type & size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File quá lớn. Vui lòng chọn ảnh dưới 5MB");
        return;
      }

      setIsUploading(true);

      // Cleanup previous image if exists (and not initial value strictly,
      // though simple logic here deletes whatever is currently previewed if valid path)
      if (preview) {
         await deleteImage(preview);
      }

      try {
        // Create unique file name: timestamp-random-filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

        const publicUrl = data.publicUrl;
        setPreview(publicUrl);
        onChange(publicUrl);
        toast.success("Upload ảnh thành công");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Không thể upload ảnh. Vui lòng thử lại.");
      } finally {
        setIsUploading(false);
      }
    },
    [bucket, onChange, preview] // Added preview dependency
  );

  const removeImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview) {
      await deleteImage(preview);
    }
    setPreview(null);
    onChange(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-lg cursor-pointer transition-colors bg-card",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
        className
      )}
    >
      <input {...getInputProps()} />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải lên...</p>
        </div>
      ) : preview ? (
        <div className="relative w-full h-full flex items-center justify-center p-2">
          <div className="relative w-full h-[200px] max-w-xs">
             <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain rounded-md"
              unoptimized // Supabase URLs might need this if domains not configured in next.config
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-sm"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
          <div className="p-3 bg-muted rounded-full">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Kéo thả hoặc click để tải ảnh</p>
            <p className="text-xs text-muted-foreground">
              Hỗ trợ PNG, JPG, WEBP (Max 5MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
