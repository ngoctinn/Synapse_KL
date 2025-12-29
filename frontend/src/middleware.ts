import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Chỉ xử lý các route thuộc /dashboard
  if (pathname.startsWith("/dashboard")) {
    // 2. Lấy role từ cookie (Giả lập)
    const userRole = request.cookies.get("user-role")?.value || "manager" // Default là manager để test

    // 3. Kiểm tra xem user có đang truy cập đúng folder của role mình không
    // Ví dụ: role "customer" không được vào "/dashboard/manager"
    const rolePaths = ["manager", "receptionist", "technician", "customer"]
    const requestedRole = rolePaths.find(role => pathname.startsWith(`/dashboard/${role}`))

    if (requestedRole && requestedRole !== userRole) {
      // Nếu truy cập sai role, redirect về đúng dashboard của mình
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url))
    }
    
    // Nếu truy cập /dashboard mà chưa có sub-path cụ thể, dispatcher sẽ xử lý
  }

  return NextResponse.next()
}

// Chỉ chạy middleware cho các route dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
}
