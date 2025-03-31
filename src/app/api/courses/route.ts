import { NextResponse } from 'next/server';
import { z } from 'zod';
import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/trpc';

const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  duration: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const caller = appRouter.createCaller(await createTRPCContext({ headers: request.headers }));
    const courses = await caller.course.getAll();
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Failed to get courses:', error);
    return NextResponse.json({ error: 'Failed to get courses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const caller = appRouter.createCaller(await createTRPCContext({ headers: request.headers }));
    const json = await request.json();
    const validatedData = courseSchema.parse(json);
    
    const course = await caller.course.create(validatedData);
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Failed to create course:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid course data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
} 