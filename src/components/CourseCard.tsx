'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, CourseWithRelations } from '@/lib/api';
import { useState, useEffect } from 'react';

interface CourseCardProps {
  course: CourseWithRelations;
  userEmail?: string | null;
  userRole?: string;
  onUpdate?: () => void;
}

export function CourseCard({ course: initialCourse, userEmail, userRole, onUpdate }: CourseCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [course, setCourse] = useState(initialCourse);

  // Keep local state in sync with prop changes
  useEffect(() => {
    setCourse(initialCourse);
  }, [initialCourse]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    setIsLoading(true);
    try {
      await api.deleteCourse(course.id);
      onUpdate?.();
      router.refresh();
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Failed to delete course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    setIsLoading(true);
    try {
      await api.enrollInCourse(course.id);
      // Update local state immediately
      setCourse({
        ...course,
        enrollments: [
          ...course.enrollments,
          { 
            id: `temp-${Date.now()}`, // Temporary ID that will be replaced on refresh
            user: { 
              id: 'temp-id',
              name: '',
              email: userEmail!,
              password: '',
              role: 'STUDENT',
              createdAt: new Date(),
              updatedAt: new Date()
            } 
          }
        ],
      });
      // Call onUpdate first to ensure parent components update their state
      onUpdate?.();
      // Then refresh the page to ensure everything is in sync
      router.refresh();
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      alert('Failed to enroll in course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnenroll = async () => {
    setIsLoading(true);
    try {
      await api.unenrollFromCourse(course.id);
      // Update local state immediately
      setCourse({
        ...course,
        enrollments: course.enrollments.filter(
          (enrollment) => enrollment.user.email !== userEmail
        ),
      });
      // Call onUpdate first to ensure parent components update their state
      onUpdate?.();
      // Then refresh the page to ensure everything is in sync
      router.refresh();
    } catch (error) {
      console.error('Failed to unenroll from course:', error);
      alert('Failed to unenroll from course');
    } finally {
      setIsLoading(false);
    }
  };

  const isEnrolled = course.enrollments.some(e => e.user.email === userEmail);
  const isCreator = course.instructor.email === userEmail;
  const isInstructor = userRole === 'INSTRUCTOR';

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <p className="text-sm text-gray-500">
            Duration: {course.duration}
          </p>
          <p className="text-sm text-gray-500">
            Instructor: {course.instructor.name}
          </p>
          <p className="text-sm text-gray-500">
            Enrolled Students: {course.enrollments.length}
          </p>
        </div>
        <div className="space-x-2">
          {isCreator && (
            <>
              <Link
                href={`/courses/${course.id}/edit`}
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </>
          )}
          {!isCreator && userEmail && (
            <button
              onClick={isEnrolled ? handleUnenroll : handleEnroll}
              disabled={isLoading}
              className={`${
                isEnrolled
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white px-4 py-2 rounded transition-colors disabled:opacity-50`}
            >
              {isLoading ? (isEnrolled ? 'Unenrolling...' : 'Enrolling...') : (isEnrolled ? (isInstructor ? 'Stop Auditing' : 'Unenroll') : (isInstructor ? 'Audit' : 'Enroll'))}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 