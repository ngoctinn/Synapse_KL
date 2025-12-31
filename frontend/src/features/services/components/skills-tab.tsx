"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
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
} from "@/shared/ui/alert-dialog";
import type { Skill } from "../types";
import { SkillFormSheet } from "./skill-form-sheet";
import { deleteSkillAction } from "../actions";

interface SkillsTabProps {
  skills: Skill[];
}

export function SkillsTab({ skills }: SkillsTabProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleAdd = () => {
    setSelectedSkill(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (skill: Skill) => {
    setSelectedSkill(skill);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    startDeleteTransition(async () => {
      try {
        await deleteSkillAction(id);
        toast.success("Xóa kỹ năng thành công");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể xóa kỹ năng");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Kỹ năng</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý các kỹ năng mà kỹ thuật viên có thể thực hiện
          </p>
        </div>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm kỹ năng
        </Button>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-12 border rounded-lg border-dashed">
          <p className="text-muted-foreground">Chưa có kỹ năng nào. Thêm kỹ năng đầu tiên.</p>
          <Button variant="link" onClick={handleAdd}>Tạo ngay</Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Tên</th>
                <th className="text-left p-3 font-medium w-40">Mã</th>
                <th className="text-left p-3 font-medium">Mô tả</th>
                <th className="text-right p-3 font-medium w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{skill.name}</td>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-2 py-0.5 rounded border">
                      {skill.code}
                    </code>
                  </td>
                  <td className="p-3 text-muted-foreground line-clamp-1">
                    {skill.description || "-"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => handleEdit(skill)}
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Sửa</span>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Xóa</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác. Kỹ năng "{skill.name}" sẽ bị xóa vĩnh viễn khỏi hệ thống.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(skill.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SkillFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        skill={selectedSkill}
      />
    </div>
  );
}

