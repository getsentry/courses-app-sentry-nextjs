import { router, protectedProcedure } from '../trpc';

export const userRouter = router({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { email: ctx.session.user.email! },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userData = await ctx.prisma.user.findUnique({
      where: { email: ctx.session.user.email! },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        courses: {
          include: {
            instructor: {
              select: {
                name: true,
                email: true,
              },
            },
            enrollments: {
              include: {
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            syllabus: true,
          },
        },
        enrollments: {
          include: {
            course: {
              include: {
                instructor: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
                enrollments: {
                  include: {
                    user: {
                      select: {
                        email: true,
                      },
                    },
                  },
                },
                syllabus: true,
              },
            },
          },
        },
      },
    });

    if (!userData) {
      console.error('User not found in database');
      throw new Error('User not found');
    }

    // Artificial delay to simulate latency
    await new Promise(resolve => setTimeout(resolve, 1000));

    const transformedData = {
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      },
      courses: userData.courses || [],
      enrollments: (userData.enrollments || []).map(enrollment => ({
        id: enrollment.id,
        course: enrollment.course,
      })),
    };

    return transformedData;
  }),
}); 