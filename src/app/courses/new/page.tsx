'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';

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

export default function NewCourse() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syllabusItems, setSyllabusItems] = useState<Array<{
    weekNumber: number;
    title: string;
    description: string;
  }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
  });

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
      await api.createCourse({
        ...data,
        syllabus: syllabusItems,
      });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Failed to create course:', error);
      setError('Failed to create course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Course</h1>
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
          {isLoading ? 'Creating...' : 'Create Course'}
        </button>
      </form>
    </div>
  );
} 