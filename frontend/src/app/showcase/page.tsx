"use client"

import { Skeleton } from "@/shared/ui/skeleton"
import dynamic from "next/dynamic"
import { AdvancedInputsShowcase } from "./components/AdvancedInputsShowcase"
import { ButtonsShowcase } from "./components/ButtonsShowcase"
import { CommandShowcase } from "./components/CommandShowcase"
import { DataDisplayShowcase } from "./components/DataDisplayShowcase"
import { FeedbackShowcase } from "./components/FeedbackShowcase"
import { FormsShowcase } from "./components/FormsShowcase"

// WHY: Overlays component is heavy with many portals and blur effects.
// Dynamic import with ssr: false helps reduce initial hydration lag.
const OverlaysShowcase = dynamic(
  () => import("./components/OverlaysShowcase").then((mod) => mod.OverlaysShowcase),
  {
    ssr: false,
    loading: () => (
      <section className="border p-4 flex flex-col gap-4">
        <h2>Overlays</h2>
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </section>
    ),
  }
)

export default function ShowcasePage() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="border p-4">
        <h1>Syncase UI Showcase</h1>
        <p>Minimalist reference for all Shadcn components (Preset: Radix/Vega/Teal).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ButtonsShowcase />
        <FormsShowcase />
        <AdvancedInputsShowcase />
        <DataDisplayShowcase />
        <OverlaysShowcase />
        <FeedbackShowcase />
      </div>

      <CommandShowcase />
    </div>
  )
}
