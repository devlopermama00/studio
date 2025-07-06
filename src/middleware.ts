import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
    iat: number;
    exp: number;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('token')?.value

  const isProtectedRoute = path.startsWith('/dashboard')
  const isAdminRoute = path.startsWith('/dashboard/admin')
  const isPublicAuthRoute = path === '/login' || path === '/register'

  // If user is logged in and tries to access login/register, redirect to dashboard
  if (token && isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
    
  // Handle authenticated user access
  if (token && isProtectedRoute) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      
      // If a non-admin tries to access an admin route, redirect them
      if (isAdminRoute && decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // If token is invalid (expired, etc.), redirect to login and clear the bad token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
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
