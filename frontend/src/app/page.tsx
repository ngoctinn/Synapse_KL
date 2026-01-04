import { Button } from "@/shared/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Synapse</h1>
        <p className="text-muted-foreground text-lg">
          Hệ thống CRM và Quản lý Spa trực tuyến cao cấp.
        </p>
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
