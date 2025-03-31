'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { api, CourseWithRelations } from '@/lib/api';
import { CourseCard } from '@/components/CourseCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function CoursePage() {
  const params = useParams();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<CourseWithRelations | null>(null);
  const [error, setError] = useState<string | null>(null);

  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await api.getCourse(id);
        setCourse(data);
      } catch (error) {
        console.error('Failed to fetch course:', error);
        setError('Failed to load course');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
          <p className="text-gray-500">The course you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const handleUpdate = async () => {
    try {
      const data = await api.getCourse(id);
      setCourse(data);
    } catch (error) {
      console.error('Failed to update course:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CourseCard 
        course={course} 
        userEmail={session?.user?.email} 
        userRole={session?.user?.role}
        onUpdate={handleUpdate}
      />
    </div>
  );
} 