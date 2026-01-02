"use client"

import { CalendarToolbar } from "@/shared/components/calendar-toolbar"
import { DataTable, DataTableColumnHeader } from "@/shared/components/data-table"
import { DatePickerWithRange } from "@/shared/components/date-range-picker"
import { DateTimePicker } from "@/shared/components/date-time-picker"
import { DurationSelect } from "@/shared/components/duration-select"
import { MultiSelect } from "@/shared/components/multi-select"
import { PageHeader } from "@/shared/components/page-header"
import { SearchInput } from "@/shared/components/search-input"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Label } from "@/shared/ui/label"
import { Separator } from "@/shared/ui/separator"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import * as React from "react"
import { DateRange } from "react-day-picker"
import { toast } from "sonner"

export function SharedComponentsShowcase() {
  const [calendarDate, setCalendarDate] = React.useState(new Date())
  const [calendarView, setCalendarView] = React.useState<"day" | "week" | "month">("week")
  const [searchValue, setSearchValue] = React.useState("")
  const [selectedServices, setSelectedServices] = React.useState<string[]>(["massage"])
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  })
  const [dateTime, setDateTime] = React.useState<Date | undefined>(new Date())
  const [duration, setDuration] = React.useState(60)

  const serviceOptions = [
    { label: "Massage", value: "massage" },
    { label: "Facial", value: "facial" },
    { label: "Manicure", value: "manicure" },
    { label: "Pedicure", value: "pedicure" },
  ]

  // Mock data for table
  const tableData = [
    { id: "1", name: "Alice Johnson", role: "Admin", status: "Active", email: "alice@example.com" },
    { id: "2", name: "Bob Smith", role: "User", status: "Inactive", email: "bob@example.com" },
    { id: "3", name: "Charlie Brown", role: "User", status: "Active", email: "charlie@example.com" },
    { id: "4", name: "Diana Prince", role: "Manager", status: "Active", email: "diana@example.com" },
    { id: "5", name: "Evan Wright", role: "User", status: "Offline", email: "evan@example.com" },
  ]

  const tableColumns: ColumnDef<typeof tableData[0]>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      meta: {
        filterOptions: [
          { label: "Admin", value: "Admin" },
          { label: "User", value: "User" },
          { label: "Manager", value: "Manager" },
        ]
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const val = row.getValue("status") as string
        return (
          <Badge variant={val === "Active" ? "success" : val === "Inactive" ? "secondary" : "outline"}>
            {val}
          </Badge>
        )
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info(`Viewing ${row.original.name}`)}>
                View details
              </DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Shared Components</h2>
        <p className="text-sm text-muted-foreground">Custom composite components for the application</p>
      </div>

      <div className="space-y-8">
        {/* Calendar Toolbar */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Calendar Toolbar</Label>
          <p className="text-xs text-muted-foreground">Navigation with view switching and keyboard shortcuts</p>
          <CalendarToolbar
            currentDate={calendarDate}
            view={calendarView}
            onViewChange={setCalendarView}
            onNavigate={setCalendarDate}
            onDateClick={() => toast.info("Date picker clicked")}
          />
        </div>

        <Separator />

        {/* Search Input */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Search Input</Label>
          <p className="text-xs text-muted-foreground">Debounced search with clear button</p>
          <SearchInput
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search components..."
          />
        </div>

        <Separator />

        {/* Multi Select */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Multi Select</Label>
          <p className="text-xs text-muted-foreground">Multi-selection dropdown with badges</p>
          <MultiSelect
            options={serviceOptions}
            selected={selectedServices}
            onChange={setSelectedServices}
            placeholder="Select services..."
          />
        </div>

        <Separator />

        {/* Date Range Picker */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Date Range Picker</Label>
          <p className="text-xs text-muted-foreground">Select date ranges with presets</p>
          <DatePickerWithRange
            value={dateRange}
            onChange={setDateRange}
          />
        </div>

        <Separator />

        {/* Date Time Picker */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Date Time Picker</Label>
          <p className="text-xs text-muted-foreground">Combined date and time selection</p>
          <DateTimePicker
            date={dateTime}
            onChange={setDateTime}
          />
        </div>

        <Separator />

        {/* Duration Select */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Duration Select</Label>
          <p className="text-xs text-muted-foreground">Service duration picker with presets</p>
          <DurationSelect
            value={duration}
            onValueChange={setDuration}
          />
        </div>

        <Separator />

        {/* Page Header */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Page Header</Label>
          <p className="text-xs text-muted-foreground">Consistent page header with title and actions</p>
          <PageHeader
            title="Example Page Title"
            subtitle="This is a page subtitle that explains what this page is about"
            actionLabel="Primary Action"
            onActionClick={() => toast.success("Action clicked!")}
          />
        </div>

        <Separator />

        {/* Smart Data Table */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Smart Data Table</Label>
          <p className="text-xs text-muted-foreground">Advanced table with sorting, filtering, selection, and pagination</p>
          <div className="border rounded-md">
            <DataTable
              columns={tableColumns}
              data={tableData}
              onRowClick={(row: typeof tableData[0]) => toast.info(`Clicked row: ${row.name}`)}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
