'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api, CourseWithRelations } from '@/lib/api';
import { CourseCard } from '@/components/CourseCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Session } from 'next-auth';

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'INSTRUCTOR' | 'STUDENT';
  };
  courses: CourseWithRelations[];
  enrollments: {
    id: string;
    course: CourseWithRelations;
  }[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession() as {
    data: Session | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getUserProfile();
        if (!data) {
          console.error('No profile data received from API');
          setError('No profile data available');
          setProfile(null);
        } else {
          
          if (!data.user || !data.courses || !data.enrollments) {
            console.error('Incomplete profile data. Missing:', {
              user: !data.user,
              courses: !data.courses,
              enrollments: !data.enrollments
            });
            setError('Incomplete profile data received');
            setProfile(null);
          } else {
            setProfile(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to load profile data');
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchProfile();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [session, status]);

  // Show loading spinner while session is loading or while fetching profile
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!session?.user) {
    redirect('/auth/login');
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No profile data available.
        </div>
      </div>
    );
  }

  const handleUpdate = async () => {
    try {
      const data = await api.getUserProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile data');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Profile</h1>
        <div className="space-y-2">
          <p><strong>Name:</strong> {profile.user.name}</p>
          <p><strong>Email:</strong> {profile.user.email}</p>
          <p><strong>Role:</strong> {profile.user.role.toLowerCase()}</p>
        </div>
      </div>

      {profile.user.role === 'INSTRUCTOR' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Created Courses</h2>
          {profile.courses.length > 0 ? (
            <div className="space-y-4">
              {profile.courses.map((course: CourseWithRelations) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  userEmail={session.user.email}
                  userRole={profile.user.role}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">You haven&apos;t created any courses yet.</p>
          )}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Enrolled Courses</h2>
        {profile.enrollments.length > 0 ? (
          <div className="space-y-4">
            {profile.enrollments.map(({ id, course }: { id: string; course: CourseWithRelations }) => (
              <CourseCard
                key={id}
                course={course}
                userEmail={session.user.email}
                userRole={profile.user.role}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven&apos;t enrolled in any courses yet.</p>
        )}
      </div>
    </div>
  );
} 