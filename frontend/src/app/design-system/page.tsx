"use client"

import { AlertCircle, Check, X } from "lucide-react"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import {
    Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue
} from "@/shared/ui/select"
import { Separator } from "@/shared/ui/separator"
import { Switch } from "@/shared/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"

export default function DesignSystemShowcase() {
  return (
    <div className="container mx-auto space-y-10 py-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">System Design Showcase</h1>
        <p className="text-muted-foreground text-lg">
          Reference components aligned with Medical Dashboard Guidelines (v2025).
        </p>
        <Separator />
      </div>

      {/* 1. BUTTONS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Buttons</h2>
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>Primary, Secondary, Outline, Ghost, Destructive</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
          </CardContent>
        </Card>
        <Card>
           <CardHeader>
            <CardTitle>Button Sizes</CardTitle>
            <CardDescription>Default (h-11), Sm (h-9), Lg (h-12), Icon</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><Check className="size-4" /></Button>
            <Button size="icon-lg"><Check className="size-5" /></Button>
          </CardContent>
        </Card>
      </section>

      {/* 2. BADGES / CHIPS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Chips & Badges</h2>
        <Card>
          <CardHeader>
            <CardTitle>Status Chips</CardTitle>
            <CardDescription>Medical status indicators: Success, Error, Warning, Info</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
             <Badge variant="default">Primary <X className="ml-1 size-3" /></Badge>
             <Badge variant="success">Success <Check className="ml-1 size-3" /></Badge>
             <Badge variant="warning">Warning <AlertCircle className="ml-1 size-3" /></Badge>
             <Badge variant="error">Error <X className="ml-1 size-3" /></Badge>
             <Badge variant="info">Info</Badge>
             <Badge variant="soft-error">Soft Error</Badge>
             <Badge variant="outline">Outline</Badge>
          </CardContent>
        </Card>
      </section>

      {/* 3. INPUTS & FORMS */}
        <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Inputs & Forms</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
            <CardHeader>
                <CardTitle>Input States</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="input-default">Default Label <span className="text-destructive">*</span></Label>
                    <Input id="input-default" placeholder="Placeholder..." />
                    <p className="text-muted-foreground text-xs">Description area</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="input-error">Error State <span className="text-destructive">*</span></Label>
                    <Input id="input-error" placeholder="Invalid input..." aria-invalid={true} />
                    <p className="text-destructive text-xs">Error message goes here</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="input-disabled">Disabled</Label>
                    <Input id="input-disabled" placeholder="Cannot type..." disabled />
                </div>
            </CardContent>
            </Card>

            <Card>
             <CardHeader>
                <CardTitle>Select & Switch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Select Option</Label>
                    <Select>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Time</SelectLabel>
                                <SelectItem value="am">Morning Shift</SelectItem>
                                <SelectItem value="pm">Afternoon Shift</SelectItem>
                                <SelectItem value="night">Overnight</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Notifications</Label>
                        <p className="text-muted-foreground text-sm">Receive alerts about schedule changes.</p>
                    </div>
                    <Switch />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Auto-Booking</Label>
                        <p className="text-muted-foreground text-sm">Allow customers to book instantly.</p>
                    </div>
                    <Switch checked />
                </div>
            </CardContent>
            </Card>
        </div>
      </section>

      {/* 4. TABS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Navigation Tabs</h2>
         <Card>
            <CardHeader>
                <CardTitle>Tab Bar (Segmented & Outline)</CardTitle>
                <CardDescription>High contrast active state for clear navigation.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="schedule" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="schedule">Giờ định kỳ</TabsTrigger>
                        <TabsTrigger value="exception">Ngày ngoại lệ</TabsTrigger>
                    </TabsList>
                    <TabsContent value="schedule" className="mt-4 rounded-lg border border-dashed p-4">
                        Schedule Content...
                    </TabsContent>
                    <TabsContent value="exception" className="mt-4 rounded-lg border border-dashed p-4">
                         Exception Content...
                    </TabsContent>
                </Tabs>
            </CardContent>
         </Card>
      </section>

    </div>
  )
}
