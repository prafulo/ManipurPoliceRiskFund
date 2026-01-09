import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

// The `auth` middleware from NextAuth.js handles session validation.
// It doesn't need to access the database directly, thus avoiding
// the Prisma-related build errors in the Edge runtime.
export default NextAuth(authConfig).auth;

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
