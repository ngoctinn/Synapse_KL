import { Button } from "@/shared/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <h1>Synapse</h1>
        <p>Hệ thống CRM và Quản lý Spa trực tuyến cao cấp.</p>
      </div>

      <div className="flex gap-4">
        <Button asChild>
          <Link href="/showcase">Xem Showcase</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Đăng nhập</Link>
        </Button>
      </div>
    </div>
  );
}
