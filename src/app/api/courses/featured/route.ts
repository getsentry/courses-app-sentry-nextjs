import { NextResponse } from 'next/server';
import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/trpc';

export async function GET(request: Request) {
    const caller = appRouter.createCaller(await createTRPCContext({ headers: request.headers }));
    const course = await caller.course.getById({ id: "cm85v87v50000abo0hfctxmg" });
    return NextResponse.json(course);
}