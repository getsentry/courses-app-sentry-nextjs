import { getServerSession } from 'next-auth';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { EditCourseForm } from './EditCourseForm';
import { Session } from 'next-auth';

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const session = (await getServerSession(auth)) as Session | null;
  const { id } = await params;

  if (!session?.user) {
    redirect('/auth/login');
  }

  return <EditCourseForm courseId={id} />;
} 