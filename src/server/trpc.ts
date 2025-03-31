import { initTRPC } from '@trpc/server';
import { getServerSession } from 'next-auth';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = (await getServerSession(auth)) as Session | null;

  return {
    prisma,
    session,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

const isAuthed = middleware(async ({ next, ctx }) => {
  if (!ctx.session?.user) {
    throw new Error('Not authenticated');
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed); 