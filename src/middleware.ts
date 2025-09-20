import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token from cookies or authorization header
  const cookieToken = request.cookies.get('auth_token')?.value;
  const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
  const token = cookieToken || headerToken;

  console.log('🔍 Middleware check:', {
    pathname,
    hasCookieToken: !!cookieToken,
    hasHeaderToken: !!headerToken,
    hasAnyToken: !!token
  });

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/sports',
    '/leagues',
    '/clubs',
    '/members',
  ];

  // Define auth routes (should redirect to dashboard if authenticated)
  const authRoutes = ['/auth/sign-in', '/auth/sign-up'];

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/waiting-room',
    '/censo-waiting-room',
    '/registro-rapido'
  ];

  // Check route types
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  console.log('🛣️ Route analysis:', {
    isProtectedRoute,
    isAuthRoute,
    isPublicRoute
  });

  // Allow public routes without token check
  if (isPublicRoute && !isAuthRoute) {
    console.log('✅ Allowing access to public route');
    return NextResponse.next();
  }

  // If accessing a protected route without token, redirect to sign-in
  if (isProtectedRoute && !token) {
    console.log('🚫 Protected route without token - redirecting to sign-in');
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If accessing auth routes with token, redirect to dashboard
  if (isAuthRoute && token) {
    console.log('🔄 Auth route with token - redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For all other routes, continue normally
  console.log('✅ Allowing request to continue');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};