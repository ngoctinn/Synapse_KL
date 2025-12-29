"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-[var(--alert-success-foreground)]" />,
        info: <InfoIcon className="size-4 text-[var(--alert-info-foreground)]" />,
        warning: <TriangleAlertIcon className="size-4 text-[var(--alert-warning-foreground)]" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:border-[var(--alert-success-border)] group-[.toaster]:bg-[var(--alert-success)] group-[.toaster]:text-[var(--alert-success-foreground)]",
          warning: "group-[.toaster]:border-[var(--alert-warning-border)] group-[.toaster]:bg-[var(--alert-warning)] group-[.toaster]:text-[var(--alert-warning-foreground)]",
          info: "group-[.toaster]:border-[var(--alert-info-border)] group-[.toaster]:bg-[var(--alert-info)] group-[.toaster]:text-[var(--alert-info-foreground)]",
          error: "group-[.toaster]:border-destructive/30 group-[.toaster]:bg-destructive/10 group-[.toaster]:text-destructive",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

