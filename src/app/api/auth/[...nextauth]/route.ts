import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const authOptions: NextAuthOptions = {
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
            where: { email: credentials.email }
          });

          if (user && user.password && bcrypt.compareSync(credentials.password, user.password)) {
            // Return the user object in the shape NextAuth expects
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
        
        // Return null if user not found or password doesn't match
        return null;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // The user object is available on the first sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.unit = user.unitId;
      }
      return token;
    },
    async session({ session, token }) {
      // The token object contains the data from the jwt callback
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
    error: '/login', // Redirecting to login on error is a safe default
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'super-secret-fallback-for-development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
