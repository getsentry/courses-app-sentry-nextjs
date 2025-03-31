import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/trpc';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = appRouter.createCaller(await createTRPCContext({ headers: request.headers }));
    const { id } = await params;
    await caller.course.enroll({ courseId: id });
    return new NextResponse(null, { status: 201 });
  } catch (error) {
    console.error('Failed to enroll in course:', error);
    return NextResponse.json({ error: 'Failed to enroll in course' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = appRouter.createCaller(await createTRPCContext({ headers: request.headers }));
    const { id } = await params;
    await caller.course.unenroll({ courseId: id });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to unenroll from course:', error);
    return NextResponse.json({ error: 'Failed to unenroll from course' }, { status: 500 });
  }
}