
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getSession(req: NextRequest) {
  // WHY: Cần implement logic verify Supabase session/cookie thực tế
  const token = req.cookies.get('sb-access-token');
  if (!token) return null;

  // WHY: Mock RBAC tạm thời để test luồng phân quyền trước khi có Auth thật
  return {
    role: 'guest',
  };
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // WHY: Cho phép truy cập các trang Public và Auth mà không cần check session
  if (path === '/' || path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/portal')) {
     return NextResponse.next();
  }

  /*
  const session = await getSession(req);
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // WHY: Chặn user truy cập trái phép vào khu vực không đúng Role của họ (Portal Separation)
  if (path.startsWith('/admin') && session.role !== 'manager') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
