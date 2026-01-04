"use client"

import { Checkbox } from "@/shared/ui/checkbox"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select"
import { Switch } from "@/shared/ui/switch"
import { Textarea } from "@/shared/ui/textarea"

export function FormsShowcase() {
  return (
    <section className="border p-4 flex flex-col gap-4">
      <h2>Form Controls</h2>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <Label htmlFor="input-demo">Input Field</Label>
          <Input id="input-demo" placeholder="Type something..." />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="textarea-demo">Textarea</Label>
          <Textarea id="textarea-demo" placeholder="Type more..." />
        </div>
        <div className="flex items-center gap-4">
          <Checkbox id="checkbox-demo" />
          <Label htmlFor="checkbox-demo">Accept terms</Label>
        </div>
        <div className="flex items-center gap-4">
          <Switch id="switch-demo" />
          <Label htmlFor="switch-demo">Toggle state</Label>
        </div>
        <RadioGroup defaultValue="option-one">
          <div className="flex items-center gap-4">
            <RadioGroupItem value="option-one" id="option-one" />
            <Label htmlFor="option-one">Option One</Label>
          </div>
          <div className="flex items-center gap-4">
            <RadioGroupItem value="option-two" id="option-two" />
            <Label htmlFor="option-two">Option Two</Label>
          </div>
        </RadioGroup>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  )
}
