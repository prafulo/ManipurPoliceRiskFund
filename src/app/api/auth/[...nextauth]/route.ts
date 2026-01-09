import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authConfig } from '@/auth.config';

// We spread the base authConfig and add the providers that require Node.js APIs
export const { handlers: { GET, POST }, auth } = NextAuth({
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
            unitId: user.unitId || null,
          };
        }
        
        return null;
      }
    }),
    ...authConfig.providers,
  ]
});
