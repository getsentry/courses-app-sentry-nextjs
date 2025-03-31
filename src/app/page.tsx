'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api, CourseWithRelations } from '@/lib/api';
import { CourseCard } from '@/components/CourseCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Link from 'next/link';
import type { User } from '@prisma/client';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<CourseWithRelations[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithRelations[]>([]);
  const [createdCourses, setCreatedCourses] = useState<CourseWithRelations[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [featuredCourse, setFeaturedCourse] = useState<CourseWithRelations | null>(null);
  useEffect(() => {
    // Only fetch if we have a session and user
    if (status === 'authenticated' && session.user) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [coursesData, enrollmentsData, userData, featuredCourseData] = await Promise.all([
            api.getAllCourses(),
            api.getUserEnrollments(),
            api.getCurrentUser(),
            api.getCourse("cm85v87v50000abo0hfctxmg")
          ]);

          setCourses(coursesData);
          setEnrolledCourses(enrollmentsData.map(e => e.course));
          setUser(userData);
          setFeaturedCourse(featuredCourseData);
          if (userData.role === 'INSTRUCTOR') {
            const userCreatedCourses = coursesData.filter(
              course => course.instructor.email === userData.email
            );
            setCreatedCourses(userCreatedCourses);
          } else {
            setCreatedCourses([]);
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } else if (status === 'unauthenticated') {
      // If we're definitely not authenticated, stop loading
      setIsLoading(false);
    }
  }, [session, status]);

  // Simplify the loading check
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (!featuredCourse) {
    throw new Error('Course not found');
  }

  // Get enrolled course IDs
  const enrolledCourseIds = new Set(enrolledCourses.map(course => course.id));
  const createdCourseIds = new Set(createdCourses.map(course => course.id));

  // Filter available courses (exclude both enrolled and created courses for instructors)
  const availableCourses = courses.filter(course => 
    !enrolledCourseIds.has(course.id) && 
    (user?.role !== 'INSTRUCTOR' || !createdCourseIds.has(course.id))
  );

  const handleUpdate = async () => {
    try {
      const [coursesData, enrollmentsData] = await Promise.all([
        api.getAllCourses(),
        api.getUserEnrollments()
      ]);

      if (user?.role === 'INSTRUCTOR') {
        setCreatedCourses(coursesData.filter(course => course.instructor.email === user.email));
      }
      setCourses(coursesData);
      setEnrolledCourses(enrollmentsData.map(e => e.course));
    } catch (error) {
      console.error('Failed to update data:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name || session.user.name}!</h1>
          {user?.role === 'INSTRUCTOR' && (
            <Link
              href="/courses/new"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Course
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Created Courses (Instructors Only) */}
          {user?.role === 'INSTRUCTOR' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Your Created Courses
              </h2>
              {createdCourses.length > 0 ? (
                <div className="space-y-4">
                  {createdCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      userEmail={user.email}
                      userRole={user.role}
                      onUpdate={handleUpdate}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  You haven&apos;t created any courses yet.
                </p>
              )}
            </div>
          )}

          {/* Enrolled/Audited Courses */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {user?.role === 'INSTRUCTOR' ? "Courses You're Auditing" : 'Your Enrolled Courses'}
            </h2>
            {enrolledCourses.length > 0 ? (
              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    userEmail={user?.email || session.user.email}
                    userRole={user?.role || session.user.role}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                {user?.role === 'INSTRUCTOR' 
                  ? "You aren't auditing any courses yet."
                  : "You haven't enrolled in any courses yet."}
              </p>
            )}
          </div>

          {/* Featured Course */}
          {featuredCourse && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Featured Course</h2>
              <CourseCard
                key={featuredCourse.id}
                  course={featuredCourse}
                  userEmail={user?.email || session.user.email}
                  userRole={user?.role || session.user.role}
                  onUpdate={handleUpdate}
              />
            </div>
          )}
          {/* Available Courses */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Available Courses</h2>
            {availableCourses.length > 0 ? (
              <div className="space-y-4">
                {availableCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    userEmail={user?.email || session.user.email}
                    userRole={user?.role || session.user.role}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No new courses available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
