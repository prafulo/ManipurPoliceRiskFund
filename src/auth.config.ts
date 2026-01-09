import type { NextAuthConfig } from 'next-auth';

// This is the base config that doesn't rely on database connections.
// It's used by both the middleware and the main NextAuth handler.
export const authConfig = {
  providers: [
    // Providers that don't require Node.js APIs can go here
    // For now, we leave it empty because CredentialsProvider requires Node.js (bcrypt, prisma)
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On sign in, `user` object is available
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.unit = user.unitId;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role and unit to the session object
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.unit = token.unit;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'super-secret-fallback-for-development',
} satisfies NextAuthConfig;
