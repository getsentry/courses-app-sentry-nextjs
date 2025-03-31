import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/trpc';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const caller = appRouter.createCaller(await createTRPCContext({ headers: request.headers }));
    const profile = await caller.user.getProfile();
    
    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(profile.enrollments);
  } catch (error) {
    console.error('Failed to get enrollments:', error);
    return NextResponse.json({ error: 'Failed to get enrollments' }, { status: 500 });
  }
} 