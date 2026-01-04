"use client"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"

export function ButtonsShowcase() {
  return (
    <section className="border p-4 flex flex-col gap-4">
      <h2>Buttons & Badges</h2>
      <div className="flex flex-wrap gap-4">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>
    </section>
  )
}
