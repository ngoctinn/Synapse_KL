"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
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
import type { ResourceGroup, Service, ServiceCategory, Skill, ServiceWithDetails } from "../types";
import { ServiceFormSheet } from "./service-form-sheet";
import { deleteServiceAction, toggleServiceStatusAction, getServiceByIdAction } from "../actions";

interface ServicesTabProps {
  services: Service[];
  categories: ServiceCategory[];
  skills: Skill[];
  resourceGroups: ResourceGroup[];
}

export function ServicesTab({
  services,
  categories,
  skills,
  resourceGroups,
}: ServicesTabProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceWithDetails | null>(null);
  const [isPending, startTransition] = useTransition();

  const getCategoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name || "Chưa phân loại";

  const formatPrice = (price: string) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
      Number(price)
    );

  const handleAdd = () => {
    setSelectedService(null);
    setIsSheetOpen(true);
  };

  const handleEdit = async (id: string) => {
    try {
      const data = await getServiceByIdAction(id);
      setSelectedService(data);
      setIsSheetOpen(true);
    } catch (error) {
      toast.error("Không thể tải chi tiết dịch vụ");
    }
  };

  const handleToggleStatus = (id: string) => {
    startTransition(async () => {
      try {
        await toggleServiceStatusAction(id);
        toast.success("Đã thay đổi trạng thái dịch vụ");
      } catch (error) {
        toast.error("Không thể thay đổi trạng thái");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteServiceAction(id);
        toast.success("Xóa dịch vụ thành công");
      } catch (error) {
        toast.error("Không thể xóa dịch vụ");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Dịch vụ</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý các dịch vụ Spa cung cấp cho khách hàng
          </p>
        </div>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm dịch vụ
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12 border rounded-lg border-dashed">
          <p className="text-muted-foreground">Chưa có dịch vụ nào. Thêm dịch vụ đầu tiên.</p>
          <Button variant="link" onClick={handleAdd}>Tạo dịch vụ</Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Dịch vụ</th>
                <th className="text-left p-3 font-medium">Danh mục</th>
                <th className="text-right p-3 font-medium">Thời gian</th>
                <th className="text-right p-3 font-medium">Giá</th>
                <th className="text-center p-3 font-medium">Trạng thái</th>
                <th className="text-right p-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="font-medium">{service.name}</div>
                    {service.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                        {service.description}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="font-normal">
                      {getCategoryName(service.category_id)}
                    </Badge>
                  </td>
                  <td className="p-3 text-right text-muted-foreground">
                    {service.duration}p (+{service.buffer_time}p)
                  </td>
                  <td className="p-3 text-right font-medium text-primary">
                    {formatPrice(service.price)}
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-7 px-2 text-xs gap-1.5 ${
                        service.is_active
                          ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                      onClick={() => handleToggleStatus(service.id)}
                      disabled={isPending}
                    >
                      {service.is_active ? (
                        <><Power className="h-3 w-3" /> Hoạt động</>
                      ) : (
                        <><PowerOff className="h-3 w-3" /> Tạm ngưng</>
                      )}
                    </Button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => handleEdit(service.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Xóa dịch vụ "{service.name}"? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(service.id)}
                              className="bg-destructive"
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

      <ServiceFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        categories={categories}
        skills={skills}
        resourceGroups={resourceGroups}
        service={selectedService}
      />
    </div>
  );
}

