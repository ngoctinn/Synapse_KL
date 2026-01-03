"use client"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"

export function ComponentVariantsShowcase() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Component Variants</h2>

      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>All available button styles and states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">Variants</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="outline-neutral">Outline Neutral</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">Sizes</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon-sm">Icon SM</Button>
              <Button size="icon">Icon</Button>
              <Button size="icon-lg">Icon LG</Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">States</p>
            <div className="flex flex-wrap gap-2">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button loading>Loading</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badge Variants</CardTitle>
          <CardDescription>All available badge styles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">Variants</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">Sizes</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge size="sm">Small</Badge>
              <Badge size="default">Default</Badge>
              <Badge size="lg">Large</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
