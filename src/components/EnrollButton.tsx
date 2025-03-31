'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  isInstructor: boolean;
}

export function EnrollButton({ courseId, isEnrolled, isInstructor }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: isEnrolled ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to update enrollment');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating enrollment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInstructor) {
    return (
      <button
        onClick={handleEnroll}
        disabled={isLoading}
        className={`px-4 py-2 rounded-lg transition-colors ${
          isEnrolled
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } disabled:opacity-50`}
      >
        {isLoading
          ? 'Loading...'
          : isEnrolled
          ? 'Stop Auditing'
          : 'Audit Course'}
      </button>
    );
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg transition-colors ${
        isEnrolled
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-green-600 text-white hover:bg-green-700'
      } disabled:opacity-50`}
    >
      {isLoading
        ? 'Loading...'
        : isEnrolled
        ? 'Drop Course'
        : 'Enroll in Course'}
    </button>
  );
} 