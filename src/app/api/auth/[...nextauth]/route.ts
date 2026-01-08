import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (user && bcrypt.compareSync(credentials.password as string, user.password)) {
          // Return the user object without the password
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            unit: user.unitId || null,
          };
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On sign in, `user` object is available
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.unit = user.unit;
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
};

export const { handlers: { GET, POST }, auth } = NextAuth(authConfig);
