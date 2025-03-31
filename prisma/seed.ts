import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create example users
  const john = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 10),
      role: Role.INSTRUCTOR,
    },
  });

  const jane = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: await bcrypt.hash('password123', 10),
      role: Role.INSTRUCTOR,
    },
  });

  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: await bcrypt.hash('password123', 10),
      role: Role.STUDENT,
    },
  });

  // Create example courses
  const webDev = await prisma.course.create({
    data: {
      title: 'Introduction to Web Development',
      description: 'Learn the basics of HTML, CSS, and JavaScript',
      duration: '8 weeks',
      instructorId: john.id,
    },
  });

  const reactDev = await prisma.course.create({
    data: {
      title: 'Advanced React Development',
      description: 'Master React with hooks, context, and advanced patterns',
      duration: '10 weeks',
      instructorId: jane.id,
    },
  });

  const dsa = await prisma.course.create({
    data: {
      title: 'Data Structures and Algorithms',
      description: 'Learn fundamental computer science concepts',
      duration: '12 weeks',
      instructorId: john.id,
    },
  });

  // Create course enrollments
  await prisma.courseEnrollment.create({
    data: {
      userId: alice.id,
      courseId: webDev.id,
    },
  });

  await prisma.courseEnrollment.create({
    data: {
      userId: alice.id,
      courseId: reactDev.id,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 