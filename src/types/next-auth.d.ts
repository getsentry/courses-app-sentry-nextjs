import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    role: 'INSTRUCTOR' | 'STUDENT';
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'INSTRUCTOR' | 'STUDENT';
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: 'INSTRUCTOR' | 'STUDENT';
  }
} 