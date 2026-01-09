import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authConfig } from '@/auth.config';

const nextAuthOptions: NextAuthOptions = {
  ...authConfig,
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
            // Return the user object without the password
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              unitId: user.unitId || undefined,
            };
          }
        } catch (e) {
          console.error('Authorize error:', e);
          // Return null to indicate failure, which Auth.js will handle.
          return null;
        }
        
        // If we get here, either the user was not found or the password did not match.
        return null;
      }
    }),
    ...authConfig.providers,
  ]
};

const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST };
