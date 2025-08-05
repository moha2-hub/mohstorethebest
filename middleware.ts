import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token')
  const isAuth = !!sessionCookie
  const isLoginPage = request.nextUrl.pathname === '/login'

  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Add cache-control header for protected pages
  const response = NextResponse.next()
  if (isAuth && !isLoginPage) {
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
  }
  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/account/:path*',
    '/settings/:path*',
    '/customer/:path*',
    '/seller/:path*',
    '/admin/:path*',
    '/customer',
    '/seller',
    '/admin',
  ],
}
