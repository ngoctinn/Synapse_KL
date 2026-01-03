import { z } from "zod";

export const staffProfileSchema = z.object({
  user_id: z.string().uuid("ID người dùng không hợp lệ"),
  full_name: z.string().min(1, "Họ tên không được để trống").max(100, "Họ tên quá dài"),
  title: z.string().min(1, "Chức danh không được để trống").max(100, "Chức danh quá dài"),
  bio: z.string().nullable().optional(),
  color_code: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu không hợp lệ"),
  is_active: z.boolean().optional(),
});

export const staffInviteSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  full_name: z.string().min(1, "Họ tên không được để trống"),
  title: z.string().min(1, "Chức danh không được để trống").default("Kỹ thuật viên"),
  role: z.enum(["manager", "receptionist", "technician", "customer"]).default("technician"),
});

export const shiftSchema = z.object({
  name: z.string().min(1, "Tên ca không được để trống").max(100, "Tên ca quá dài"),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Giờ bắt đầu không hợp lệ (HH:mm)"),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Giờ kết thúc không hợp lệ (HH:mm)"),
  color_code: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu không hợp lệ").nullable().optional(),
}).refine((data) => {
  const [startHour, startMin] = data.start_time.split(":").map(Number);
  const [endHour, endMin] = data.end_time.split(":").map(Number);
  return (startHour * 60 + startMin) < (endHour * 60 + endMin);
}, {
  message: "Giờ bắt đầu phải trước giờ kết thúc",
  path: ["end_time"],
});

export const staffSkillsSchema = z.object({
  skill_ids: z.array(z.string().uuid()),
});

export const staffScheduleSchema = z.object({
  staff_id: z.string().uuid(),
  shift_id: z.string().uuid(),
  work_date: z.string(), // YYYY-MM-DD
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]),
});
