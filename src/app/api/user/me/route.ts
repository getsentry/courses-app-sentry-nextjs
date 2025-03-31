import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/trpc';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const caller = appRouter.createCaller(await createTRPCContext({ headers: request.headers }));
    const user = await caller.user.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to get user:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
} 