import { NextResponse } from 'next/server';
import { z } from 'zod';
import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/trpc';

const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  duration: z.string().min(1),
  syllabus: z.array(z.object({
    weekNumber: z.number(),
    title: z.string(),
    description: z.string(),
  })).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = appRouter.createCaller(await createTRPCContext({ headers: request.headers }));
    const { id } = await params;
    const course = await caller.course.getById({ id });
    return NextResponse.json(course);
  } catch (error) {
    console.error('Failed to get course:', error);
    return NextResponse.json({ error: 'Failed to get course' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = appRouter.createCaller(await createTRPCContext({ headers: request.headers }));
    const json = await request.json();
    const validatedData = courseSchema.parse(json);
    const { id } = await params;
    const course = await caller.course.update({
      id: id,
      ...validatedData,
    });
    
    return NextResponse.json(course);
  } catch (error) {
    console.error('Failed to update course:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid course data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = appRouter.createCaller(await createTRPCContext({ headers: request.headers }));
    const { id } = await params;
    await caller.course.delete({ id });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete course:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
} 