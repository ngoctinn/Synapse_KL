"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import { Progress } from "@/shared/ui/progress"
import { Separator } from "@/shared/ui/separator"
import { Skeleton } from "@/shared/ui/skeleton"
import * as React from "react"
import { toast } from "sonner"

export function FeedbackShowcase() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <section className="border p-4 flex flex-col gap-4">
      <h2>Feedback & Others</h2>
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-4 flex-1">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
      <Progress value={60} />
      <Button onClick={() => toast.success("Notification sent")}>
        Show Toast
      </Button>
      <Separator />
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="border"
        />
      </div>
    </section>
  )
}
