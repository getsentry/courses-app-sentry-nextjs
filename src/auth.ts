import NextAuth from 'next-auth';
import type { DefaultSession, AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: 'INSTRUCTOR' | 'STUDENT';
      name: string;
      email: string;
    }
  }

  interface User {
    id: string;
    role: 'INSTRUCTOR' | 'STUDENT';
    name: string;
    email: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'INSTRUCTOR' | 'STUDENT';
    name: string;
    email: string;
  }
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not set');
}

export const config: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);
          
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              role: true,
            },
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      
      if (user) {
        // When signing in, copy all user properties to the token
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      if (trigger === 'update' && session) {
        // Handle session updates
        Object.assign(token, session);
      }
      
      return token;
    },
    async session({ session, token }) {
      
      if (!token?.id || !token?.role) {
        console.error('Token is missing required fields:', token);
        throw new Error('Token is missing required fields');
      }

      session.user = {
        id: token.id,
        role: token.role,
        name: token.name || session.user?.name,
        email: token.email || session.user?.email,
      };
      
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config); 