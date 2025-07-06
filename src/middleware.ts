import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose';

// Use a TextEncoder to create a key suitable for `jose`
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

interface DecodedToken {
    id: string;
    role: 'user' | 'provider' | 'admin';
}

async function verifyToken(token: string): Promise<DecodedToken | null> {
    if (!token) return null;
    try {
        // Use jose's jwtVerify for Edge compatibility
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as DecodedToken;
    } catch (error) {
        console.error("JWT verification error in middleware:", error);
        return null;
    }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value || '';

  const isProtectedRoute = path.startsWith('/dashboard');
  const isAdminRoute = path.startsWith('/dashboard/admin');
  const isPublicAuthRoute = path === '/login' || path === '/register';

  const user = await verifyToken(token);

  // If user is logged in and tries to access login/register, redirect to dashboard
  if (user && isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!user && isProtectedRoute) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
    
  // If a non-admin user tries to access an admin route, redirect to their dashboard
  if (user && isAdminRoute && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register'
  ],
}
