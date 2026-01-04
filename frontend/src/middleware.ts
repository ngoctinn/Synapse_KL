import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // TODO: Implement actual RBAC logic with Supabase Auth
  // const userRole = ...

  // Placeholder logic
  const url = request.nextUrl.pathname

  if (url === '/') {
    // Redirect logic placeholder
    // return NextResponse.redirect(new URL('/portal', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
