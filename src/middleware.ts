import { auth } from '@/auth';

export default auth;

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - login (the login page itself)
   * - The logo image
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|logo.svg).*)',
  ],
};
