'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  duration: z.string().min(1, 'Duration is required'),
  syllabus: z.array(z.object({
    weekNumber: z.number(),
    title: z.string(),
    description: z.string(),
  })).default([]),
});

type CourseForm = z.infer<typeof courseSchema>;

interface EditCourseFormProps {
  courseId: string;
}

export function EditCourseForm({ courseId }: EditCourseFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syllabusItems, setSyllabusItems] = useState<Array<{
    weekNumber: number;
    title: string;
    description: string;
  }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const course = await api.getCourse(courseId);
        reset({
          title: course.title,
          description: course.description,
          duration: course.duration,
        });
        setSyllabusItems(course.syllabus);
      } catch (error) {
        console.error('Failed to fetch course:', error);
        setError('Failed to load course data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, reset]);

  const addSyllabusItem = () => {
    setSyllabusItems([
      ...syllabusItems,
      {
        weekNumber: syllabusItems.length + 1,
        title: '',
        description: '',
      },
    ]);
  };

  const updateSyllabusItem = (index: number, field: string, value: string) => {
    const newItems = [...syllabusItems];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'weekNumber' ? parseInt(value) : value,
    };
    setSyllabusItems(newItems);
  };

  const onSubmit = async (data: CourseForm) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.updateCourse(courseId, {
        ...data,
        syllabus: syllabusItems,
      });
      router.push(`/courses/${courseId}`);
      router.refresh();
    } catch (error) {
      console.error('Failed to update course:', error);
      setError('Failed to update course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            {...register('title')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Duration</label>
          <input
            type="text"
            {...register('duration')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">Syllabus</label>
            <button
              type="button"
              onClick={addSyllabusItem}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Add Week
            </button>
          </div>
          {syllabusItems.map((item, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Week Number</label>
                  <input
                    type="number"
                    value={item.weekNumber}
                    onChange={(e) => updateSyllabusItem(index, 'weekNumber', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateSyllabusItem(index, 'title', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateSyllabusItem(index, 'description', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="text-red-600">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Update Course'}
        </button>
      </form>
    </div>
  );
} 