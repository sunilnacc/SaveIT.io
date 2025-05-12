
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'firebaseIdToken'; // This is an example, Firebase JS SDK manages token in IndexedDB usually.
                                          // For server-side checks, you'd typically set a session cookie after verifying ID token.
                                          // For client-side routing protection, this middleware is simplified.
                                          // A more robust solution involves token verification or relying on client-side auth checks.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = ['/', '/login', '/signup']; // Add any other public paths
  const isPublicPath = publicPaths.some(path => pathname === path || (path !== '/' && pathname.startsWith(path + '/')));


  // For this example, we assume if a user attempts to access protected routes,
  // the client-side AuthProvider and route guards in components will handle redirection
  // or show appropriate UI.
  // A true server-side protection would involve checking a secure, httpOnly session cookie
  // that you set after Firebase ID token verification.

  // This middleware focuses on redirecting from root to dashboard if "logged in" (via a conceptual cookie)
  // or to login if trying to access dashboard without it.
  // Firebase Auth is primarily client-side, so actual token for API calls is handled by Firebase SDK.
  // This middleware can check for a session cookie if you implement Firebase Admin SDK based sessions.

  const currentUserCookie = request.cookies.get('firebaseAuthUser'); // A conceptual cookie, not standard Firebase JS SDK output

  if (pathname === '/') {
    // If user is on splash screen and (conceptually) logged in, redirect to dashboard
    // This cookie is not automatically set by Firebase client SDK.
    // You would need to set it manually after login if using this logic.
    // For a pure client-side auth app, this redirection is often handled in the splash page component itself.
    // return NextResponse.next(); // For now, let splash screen handle its own logic.
  }


  const protectedPaths = ['/dashboard', '/profile'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    // This is where you'd check for a valid session cookie if using server-side sessions.
    // Since Firebase auth state is client-managed by default, actual protection
    // often relies on client-side checks + API route protection.
    // For a simplified example, if a conceptual 'session' cookie isn't present, redirect.
    // However, without a real session management, this is limited.
    // The AuthProvider in `AuthContext.tsx` and component-level checks are more crucial for client-side SPA behavior.
    // This middleware won't redirect for protected paths for now to rely on client-side checks.
    // A more robust solution is needed for true server-enforced route protection with Firebase.
  }


  // If trying to access login/signup while "logged in", redirect to dashboard.
  // Again, this relies on a conceptual cookie.
  if ((pathname === '/login' || pathname === '/signup') && currentUserCookie) {
    // For now, allow access to login/signup pages even if a conceptual cookie exists,
    // as the client-side auth state is the source of truth.
    // The login/signup pages can redirect if user is already authenticated via useAuth.
  }


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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
