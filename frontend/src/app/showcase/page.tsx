"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Badge } from "@/shared/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb"
import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { Checkbox } from "@/shared/ui/checkbox"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/ui/combobox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/shared/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
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
import { Label } from "@/shared/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover"
import { Progress } from "@/shared/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Separator } from "@/shared/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet"
import { Skeleton } from "@/shared/ui/skeleton"
import { Switch } from "@/shared/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/shared/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Textarea } from "@/shared/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip"
import { MailIcon, SearchIcon } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

export default function ShowcasePage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="border p-4">
        <h1>Syncase UI Showcase</h1>
        <p>Minimalist reference for all Shadcn components (Preset: Radix/Vega/Teal).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Buttons & Badges */}
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

        {/* Form Controls */}
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

        {/* Input Groups & Combobox */}
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

        {/* Field System */}
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

        {/* Navigation & Tabs */}
        <section className="border p-4 flex flex-col gap-4">
          <h2>Navigation</h2>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/showcase">Showcase</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Current</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Tabs defaultValue="account">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="p-4 border">
              Account content here.
            </TabsContent>
            <TabsContent value="password" className="p-4 border">
              Change password here.
            </TabsContent>
          </Tabs>
        </section>

        {/* Overlays */}
        <section className="border p-4 flex flex-col gap-4">
          <h2>Overlays</h2>
          <div className="flex flex-wrap gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog Title</DialogTitle>
                  <DialogDescription>
                    This is a basic dialog component.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Open Alert</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Open Sheet</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sheet Title</SheetTitle>
                  <SheetDescription>
                    Sidebar content goes here.
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Popover</Button>
              </PopoverTrigger>
              <PopoverContent>
                Popover content area.
              </PopoverContent>
            </Popover>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tooltip text</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>

        {/* Data Display */}
        <section className="border p-4 flex flex-col gap-4">
          <h2>Data Display</h2>
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description.</CardDescription>
            </CardHeader>
            <CardContent>
              Some main content here.
            </CardContent>
            <CardFooter>
              Card Footer.
            </CardFooter>
          </Card>

          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Accordion Question 1</AccordionTrigger>
              <AccordionContent>
                Accordion Answer 1.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Accordion Question 2</AccordionTrigger>
              <AccordionContent>
                Accordion Answer 2.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Header 1</TableHead>
                <TableHead>Header 2</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Data A1</TableCell>
                <TableCell>Data A2</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Data B1</TableCell>
                <TableCell>Data B2</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        {/* Feedback & Others */}
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

      </div>

      {/* Full width Command section */}
      <section className="border p-4 flex flex-col gap-4">
        <h2>Command Menu</h2>
        <Command className="border">
          <CommandInput placeholder="Type a command..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>Profile</CommandItem>
              <CommandItem>Billing</CommandItem>
              <CommandItem>Settings</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </section>
    </div>
  )
}
