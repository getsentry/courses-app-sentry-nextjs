import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

const syllabusItemSchema = z.object({
  weekNumber: z.number(),
  title: z.string(),
  description: z.string(),
});

export const courseRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.course.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),

  getEnrollmentCount: publicProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const enrollments = await ctx.prisma.courseEnrollment.findMany({
        where: { courseId: input.courseId },
      });
      
      return enrollments.length;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.course.findUnique({
        where: { id: input.id },
        include: {
          instructor: true,
          enrollments: {
            include: {
              user: true,
            },
          },
          syllabus: true,
        },
      });
    }),

  getUserEnrollments: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.courseEnrollment.findMany({
      where: {
        userId: ctx.session.user.id,
      },
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
    });
  }),

  getUserCreatedCourses: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.course.findMany({
      where: {
        instructorId: ctx.session.user.id,
      },
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
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        duration: z.string().min(1),
        syllabus: z.array(syllabusItemSchema).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First find the user to ensure they exist
      const user = await ctx.prisma.user.findUnique({
        where: { email: ctx.session.user.email! },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const { syllabus, ...courseData } = input;
      return ctx.prisma.course.create({
        data: {
          ...courseData,
          instructor: {
            connect: { id: user.id }
          },
          syllabus: {
            create: syllabus,
          },
        },
        include: {
          instructor: {
            select: {
              name: true,
              email: true,
            },
          },
          syllabus: true,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        description: z.string().min(1),
        duration: z.string().min(1),
        syllabus: z.array(syllabusItemSchema).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, syllabus, ...data } = input;
      
      // First delete all existing syllabus items
      await ctx.prisma.syllabus.deleteMany({
        where: { courseId: id },
      });

      // Then update the course and create new syllabus items
      return ctx.prisma.course.update({
        where: { id },
        data: {
          ...data,
          syllabus: {
            create: syllabus,
          },
        },
        include: {
          syllabus: true,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First delete all syllabus items
      await ctx.prisma.syllabus.deleteMany({
        where: { courseId: input.id },
      });

      // Then delete the course
      return ctx.prisma.course.delete({
        where: { id: input.id },
      });
    }),

  enroll: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First find the user to ensure they exist
      const user = await ctx.prisma.user.findUnique({
        where: { email: ctx.session.user.email! },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create the enrollment with proper user connection
      return ctx.prisma.courseEnrollment.create({
        data: {
          user: {
            connect: { id: user.id }
          },
          course: {
            connect: { id: input.courseId }
          }
        },
      });
    }),

  unenroll: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First find the enrollment record
      const enrollment = await ctx.prisma.courseEnrollment.findFirst({
        where: {
          userId: ctx.session.user.id,
          courseId: input.courseId,
        },
      });

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      // Then delete it by its id
      return ctx.prisma.courseEnrollment.delete({
        where: {
          id: enrollment.id,
        },
      });
    }),
}); 