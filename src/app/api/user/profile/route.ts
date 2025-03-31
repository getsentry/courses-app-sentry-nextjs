import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/trpc';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const caller = appRouter.createCaller(await createTRPCContext({ headers: request.headers }));
    const profile = await caller.user.getProfile();
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to get profile:', error);
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 });
  }
} 