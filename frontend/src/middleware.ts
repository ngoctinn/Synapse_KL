import { NextResponse, type NextRequest } from "next/server"

// WHY: Tạm thời disable auth để test routing structure
// TODO: Enable lại khi setup Supabase Auth

export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
