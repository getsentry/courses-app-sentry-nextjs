'use client';

import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: (Session & {
    user: {
      id: string;
      role: 'INSTRUCTOR' | 'STUDENT';
      name: string;
      email: string;
    }
  }) | null;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
} 