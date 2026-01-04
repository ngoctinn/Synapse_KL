"use client"

import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/shared/ui/combobox"
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
} from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput
} from "@/shared/ui/input-group"
import { Switch } from "@/shared/ui/switch"
import { MailIcon, SearchIcon } from "lucide-react"

export function AdvancedInputsShowcase() {
  return (
    <>
      <section className="border p-4 flex flex-col gap-4">
        <h2>Input Groups & Combobox</h2>
        <div className="flex flex-col gap-4">
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <MailIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Email" />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon align="inline-start">
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search..." />
            <InputGroupAddon align="inline-end">
              <InputGroupButton>Search</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          <Combobox>
            <ComboboxInput placeholder="Select fruit" showTrigger showClear />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxItem value="apple">Apple</ComboboxItem>
                <ComboboxItem value="banana">Banana</ComboboxItem>
                <ComboboxItem value="orange">Orange</ComboboxItem>
                <ComboboxEmpty>No results found.</ComboboxEmpty>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </section>

      <section className="border p-4 flex flex-col gap-4">
        <h2>Field System</h2>
        <Field>
          <FieldLabel>Full Name</FieldLabel>
          <FieldContent>
            <Input placeholder="John Doe" />
          </FieldContent>
          <FieldDescription>Please enter your legal name.</FieldDescription>
        </Field>

        <Field orientation="horizontal">
          <FieldLabel>Enable Privacy</FieldLabel>
          <FieldContent>
            <Switch />
          </FieldContent>
        </Field>
      </section>
    </>
  )
}
