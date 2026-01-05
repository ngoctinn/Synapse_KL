"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Edit2, Plus, Search, Trash2 } from "lucide-react"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader } from "@/shared/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

import { Badge } from "@/shared/ui/badge"
import { createSkill, deleteSkill, updateSkill } from "../api/actions"
import { Skill, SkillCreateValues, skillCreateSchema } from "../model/schemas"

interface SkillListViewProps {
  initialSkills: Skill[]
}

export function SkillManagementView({ initialSkills }: SkillListViewProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills)
  const [search, setSearch] = useState("")
  const [isPending, startTransition] = useTransition()

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)

  // Alert Dialog states
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null)

  const filteredSkills = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  )

  const form = useForm<SkillCreateValues>({
    resolver: zodResolver(skillCreateSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  })

  // Open dialog for create/edit
  const handleOpenDialog = (skill?: Skill) => {
    if (skill) {
      setEditingSkill(skill)
      form.reset({
        name: skill.name,
        code: skill.code,
        description: skill.description || "",
      })
    } else {
      setEditingSkill(null)
      form.reset({
        name: "",
        code: "",
        description: "",
      })
    }
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: SkillCreateValues) => {
    startTransition(async () => {
      if (editingSkill) {
        const res = await updateSkill(editingSkill.id, values)
        if (res.success) {
          toast.success("Đã cập nhật kỹ năng")
          setSkills(prev => prev.map(s => s.id === editingSkill.id ? (res.data as Skill) : s))
          setIsDialogOpen(false)
        } else {
          toast.error(res.error || "Lỗi cập nhật")
        }
      } else {
        const res = await createSkill(values)
        if (res.success) {
          toast.success("Đã thêm kỹ năng mới")
          setSkills(prev => [...prev, res.data as Skill])
          setIsDialogOpen(false)
        } else {
          toast.error(res.error || "Lỗi tạo mới")
        }
      }
    })
  }

  const handleDelete = async () => {
    if (!skillToDelete) return

    startTransition(async () => {
      const res = await deleteSkill(skillToDelete.id)
      if (res.success) {
        toast.success("Đã xóa kỹ năng")
        setSkills(prev => prev.filter(s => s.id !== skillToDelete.id))
        setSkillToDelete(null)
      } else {
        toast.error(res.error || "Không thể xóa kỹ năng đang được sử dụng")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý Kỹ năng</h2>
          <p className="text-muted-foreground">
            Định nghĩa các bộ kỹ năng chuyên môn cần thiết cho các dịch vụ spa.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm kỹ năng
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm kỹ năng..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Mã</TableHead>
                  <TableHead>Tên kỹ năng</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="w-[100px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSkills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Không tìm thấy kỹ năng nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSkills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {skill.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{skill.name}</TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground">
                        {skill.description || "---"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(skill)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setSkillToDelete(skill)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSkill ? "Cập nhật kỹ năng" : "Thêm kỹ năng mới"}</DialogTitle>
            <DialogDescription>
              Thông tin này giúp hệ thống tự động gán nhân viên phù hợp cho lịch hẹn.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên kỹ năng</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Massage Thụy Điển" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã định danh (Code)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: MASSAGE_SWEDISH"
                        {...field}
                        readOnly={!!editingSkill}
                        className={editingSkill ? "bg-muted" : ""}
                      />
                    </FormControl>
                    <FormDescription className="text-[10px]">
                      Mã code là duy nhất và không nên thay đổi sau khi tạo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Input placeholder="Chi tiết về kỹ năng này..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Đang xử lý..." : editingSkill ? "Cập nhật" : "Tạo mới"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!skillToDelete} onOpenChange={() => setSkillToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa kỹ năng này?</AlertDialogTitle>
            <AlertDialogDescription>
              Kỹ năng <span className="font-bold">{skillToDelete?.name}</span> sẽ bị xóa vĩnh viễn khỏi hệ thống.
              Hệ thống sẽ không cho phép xóa nếu có dịch vụ hoặc nhân viên đang sử dụng kỹ năng này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? "Đang xóa..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


