import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const nextAuthOptions: NextAuthOptions = {
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

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          });

          if (user && user.password && bcrypt.compareSync(credentials.password as string, user.password)) {
            // Return the user object with all necessary properties for the session
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              unitId: user.unitId,
            };
          }
        } catch (e) {
          console.error('Authorize error:', e);
          return null;
        }
        
        return null;
      }
    }),
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
};

const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST };
