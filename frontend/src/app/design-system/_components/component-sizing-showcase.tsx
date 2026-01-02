import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs"

export function ComponentSizingShowcase() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Component Sizing Standards</h2>
      <Card>
        <CardHeader>
          <CardTitle>Size Variants Comparison</CardTitle>
          <CardDescription>
            All components aligned to 8px grid system with WCAG-compliant defaults
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Label className="text-xs text-muted-foreground">Button Sizes</Label>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small (h-9)</Button>
              <Button size="default">Default (h-12)</Button>
              <Button size="lg">Large (h-14)</Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="outline" size="sm">Outline Small</Button>
              <Button variant="outline" size="default">Outline Default</Button>
              <Button variant="outline" size="lg">Outline Large</Button>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs text-muted-foreground">Input Sizes</Label>
            <div className="grid gap-4 md:grid-cols-3">
              <Input size="sm" placeholder="Small (h-10)" />
              <Input size="default" placeholder="Default (h-12)" />
              <Input size="lg" placeholder="Large (h-14)" />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs text-muted-foreground">Select Sizes</Label>
            <div className="grid gap-4 md:grid-cols-3">
              <Select>
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Small (h-10)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Option 1</SelectItem>
                  <SelectItem value="2">Option 2</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger size="default">
                  <SelectValue placeholder="Default (h-12)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Option 1</SelectItem>
                  <SelectItem value="2">Option 2</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger size="lg">
                  <SelectValue placeholder="Large (h-14)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Option 1</SelectItem>
                  <SelectItem value="2">Option 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs text-muted-foreground">Tabs Sizes</Label>
            <div className="space-y-4">
              <Tabs defaultValue="tab1">
                <TabsList size="sm">
                  <TabsTrigger value="tab1">Small (h-9)</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs defaultValue="tab1">
                <TabsList size="default">
                  <TabsTrigger value="tab1">Default (h-10)</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs defaultValue="tab1">
                <TabsList size="lg">
                  <TabsTrigger value="tab1">Large (h-12)</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs text-muted-foreground">Badge Sizes</Label>
            <div className="flex flex-wrap items-center gap-4">
              <Badge size="sm">Small (h-5)</Badge>
              <Badge size="default">Default (h-6)</Badge>
              <Badge size="lg">Large (h-7)</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="outline" size="sm">Outline Small</Badge>
              <Badge variant="outline" size="default">Outline Default</Badge>
              <Badge variant="outline" size="lg">Outline Large</Badge>
            </div>
          </div>

          <div className="text-xs text-muted-foreground p-3 bg-muted/20 rounded-lg">
            <p className="font-semibold mb-1">Sizing Guidelines:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><strong>sm:</strong> Compact UI, secondary actions (36-40px)</li>
              <li><strong>default:</strong> Standard size, WCAG compliant (44-48px)</li>
              <li><strong>lg:</strong> Prominent CTAs, mobile-first (52-56px)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
