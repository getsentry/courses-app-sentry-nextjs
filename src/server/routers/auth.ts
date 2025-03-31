import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import bcrypt from 'bcryptjs';

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, email, password } = input;
      const hashedPassword = await bcrypt.hash(password, 10);

      return ctx.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
    }),

  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
}); 