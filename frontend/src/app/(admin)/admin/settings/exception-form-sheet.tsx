"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { OperationalSettingsValues } from "./schemas"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import {
  FormLabel
} from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet"
import { Switch } from "@/shared/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

// Reusing same time slots
const TIME_SLOTS = Array.from({ length: 49 }).map((_, i) => {
    const totalMinutes = i * 30
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
})

export function ExceptionDateForm() {
    const { control } = useFormContext<OperationalSettingsValues>()
    const { fields, append, remove } = useFieldArray({
        control,
        name: "exceptionDates"
    })

    // Sheet local form state (controlled by a separate specialized form or just managing append directly)
    // To keep it simple for now, we'll just show the list table here
    // And implement the "Add" logic via a controlled Sheet form in a real app,
    // or reusing the main form context if we want to "add to pending list".
    // Here we assume "Add" opens a Sheet that appends to the `exceptionDates` field array upon save.

    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [newException, setNewException] = useState<{
        date: Date | undefined,
        reason: string,
        isClosed: boolean,
        openTime: string,
        closeTime: string
    }>({
        date: undefined,
        reason: "",
        isClosed: true,
        openTime: "08:00",
        closeTime: "20:00"
    })

    const handleAdd = () => {
        if (!newException.date) return

        append({
            date: newException.date,
            reason: newException.reason,
            isClosed: newException.isClosed,
            openTime: newException.isClosed ? undefined : newException.openTime,
            closeTime: newException.isClosed ? undefined : newException.closeTime
        })
        setIsSheetOpen(false)
        setNewException({ // Reset
             date: undefined,
            reason: "",
            isClosed: true,
            openTime: "08:00",
            closeTime: "20:00"
        })
    }

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    Danh sách các ngày nghỉ lễ hoặc có giờ làm việc đặc biệt.
                </div>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Thêm ngày nghỉ</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Thêm ngày ngoại lệ</SheetTitle>
                            <SheetDescription>
                                Cấu hình ngày nghỉ hoặc giờ làm việc đặc biệt.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="grid gap-4 p-4">
                            <div className="grid gap-2">
                                <FormLabel>Ngày</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !newException.date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newException.date ? format(newException.date, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={newException.date}
                                            onSelect={(d) => setNewException({...newException, date: d})}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid gap-2">
                                <FormLabel>Lý do / Tên dịp lễ</FormLabel>
                                <Input
                                    value={newException.reason}
                                    onChange={(e) => setNewException({...newException, reason: e.target.value})}
                                    placeholder="Ví dụ: Tết Nguyên Đán"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is-closed"
                                    checked={newException.isClosed}
                                    onCheckedChange={(c) => setNewException({...newException, isClosed: c})}
                                />
                                <FormLabel htmlFor="is-closed">Đóng cửa cả ngày</FormLabel>
                            </div>

                            {!newException.isClosed && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <FormLabel>Giờ mở</FormLabel>
                                         <Select
                                            value={newException.openTime}
                                            onValueChange={(v) => setNewException({...newException, openTime: v})}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                         <FormLabel>Giờ đóng</FormLabel>
                                         <Select
                                            value={newException.closeTime}
                                            onValueChange={(v) => setNewException({...newException, closeTime: v})}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>
                        <SheetFooter>
                            <Button onClick={handleAdd}>Thêm vào danh sách</Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ngày</TableHead>
                            <TableHead>Lý do</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                    Chưa có ngày ngoại lệ nào.
                                </TableCell>
                            </TableRow>
                        )}
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                                <TableCell>
                                    {format(field.date, "dd/MM/yyyy")}
                                </TableCell>
                                <TableCell>{field.reason}</TableCell>
                                <TableCell>
                                    {field.isClosed ? (
                                        <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive ring-1 ring-inset ring-destructive/20">
                                            Đóng cửa
                                        </span>
                                    ) : (
                                        <span>{field.openTime} - {field.closeTime}</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
