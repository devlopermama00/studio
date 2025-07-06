import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isProtectedRoute = path.startsWith('/dashboard')
  const isAdminRoute = path.startsWith('/dashboard/admin')
  const isPublicAuthRoute = path === '/login' || path === '/register'

  const token = request.cookies.get('token')?.value

  // If user is logged in and tries to access login/register, redirect to dashboard
  if (token && isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
    
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register'
  ],
}
