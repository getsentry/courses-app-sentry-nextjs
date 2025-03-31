import { router } from './trpc';
import { courseRouter } from './routers/course';
import { authRouter } from './routers/auth';
import { userRouter } from './routers/user';

export const appRouter = router({
  course: courseRouter,
  auth: authRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter; 