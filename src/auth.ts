
import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authConfig = {
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          console.log('No credentials provided');
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.log(`User not found for email: ${credentials.email}`);
            return null;
          }

          if (!user.password) {
            console.log(`User ${credentials.email} has no password set.`);
            return null;
          }

          const passwordMatch = await bcrypt.compare(credentials.password as string, user.password);

          if (passwordMatch) {
            console.log(`Password match for user: ${credentials.email}`);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              unitId: user.unitId,
            };
          } else {
             console.log(`Password mismatch for user: ${credentials.email}`);
             return null;
          }
        } catch (e) {
          console.error('Authorize error:', e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.unit = user.unitId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.unit = token.unit as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);





