"use client"

import { Separator } from "@/shared/ui/separator"
import { ComponentSizingShowcase, ComponentVariantsShowcase, SharedComponentsShowcase } from "./_components"

export default function DesignSystemShowcase() {
  return (
    <div className="container mx-auto space-y-10 py-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Synapse Design System</h1>
        <p className="text-muted-foreground text-lg">
          Complete UI component library with all variants, sizes, and interactive examples.
        </p>
        <Separator />
      </div>

      <ComponentSizingShowcase />

      <Separator className="my-10" />

      <ComponentVariantsShowcase />

      <Separator className="my-10" />

      <SharedComponentsShowcase />

      <Separator className="my-10" />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Documentation</h2>
        <div className="p-6 border rounded-lg bg-muted/10">
          <p className="text-sm text-muted-foreground mb-4">
            For complete documentation and guidelines:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>
              <code className="px-2 py-1 bg-muted rounded text-xs">
                .agent/docs/UI_SIZING_STANDARDS.md
              </code>
              {" "}- Component sizing system and 8px grid
            </li>
            <li>
              <code className="px-2 py-1 bg-muted rounded text-xs">
                .agent/docs/COMPONENT_VARIANTS_REFERENCE.md
              </code>
              {" "}- Complete variants matrix and usage guide
            </li>
            <li>
              <code className="px-2 py-1 bg-muted rounded text-xs">
                .agent/docs/TABS_HEIGHT_FIX.md
              </code>
              {" "}- Tabs height alignment solution
            </li>
            <li>
              <code className="px-2 py-1 bg-muted rounded text-xs">
                .agent/docs/SHARED_COMPONENTS_INVENTORY.md
              </code>
              {" "}- All shared components inventory
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
