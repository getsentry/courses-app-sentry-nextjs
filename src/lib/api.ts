import type { Course, User } from '@prisma/client';

// Types
export interface CourseWithRelations extends Course {
  instructor: User;
  enrollments: {
    id: string;
    user: User;
  }[];
  syllabus: Array<{
    weekNumber: number;
    title: string;
    description: string;
  }>;
}

export type EnrollmentWithCourse = {
  id: string;
  userId: string;
  courseId: string;
  course: CourseWithRelations;
};

export type CreateCourseInput = {
  title: string;
  description: string;
  duration: string;
  syllabus?: Array<{
    weekNumber: number;
    title: string;
    description: string;
  }>;
};

// API Client
class ApiClient {
  private async fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Return null for 204 No Content responses
    if (response.status === 204) {
      return null as T;
    }

    // For 201 Created responses with no content, return null
    if (response.status === 201 && response.headers.get('content-length') === '0') {
      return null as T;
    }

    return response.json();
  }

  private async fetch(url: string, init?: RequestInit): Promise<void> {
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  // Courses
  async getAllCourses(): Promise<CourseWithRelations[]> {
    return this.fetchJson('/api/courses');
  }

  async getCourse(id: string): Promise<CourseWithRelations> {
    return this.fetchJson(`/api/courses/${id}`);
  }

  async getFeaturedCourse(): Promise<CourseWithRelations> {
    return this.fetchJson('/api/courses/featured');
  }

  async createCourse(data: CreateCourseInput): Promise<CourseWithRelations> {
    return this.fetchJson('/api/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourse(id: string, data: CreateCourseInput): Promise<CourseWithRelations> {
    return this.fetchJson(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCourse(id: string): Promise<void> {
    return this.fetch(`/api/courses/${id}`, {
      method: 'DELETE',
    });
  }

  async enrollInCourse(courseId: string): Promise<void> {
    return this.fetch(`/api/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  }

  async unenrollFromCourse(courseId: string): Promise<void> {
    return this.fetch(`/api/courses/${courseId}/enroll`, {
      method: 'DELETE',
    });
  }

  // User
  async getUserEnrollments(): Promise<EnrollmentWithCourse[]> {
    return this.fetchJson('/api/user/enrollments');
  }

  async getCurrentUser(): Promise<User> {
    return this.fetchJson('/api/user/me');
  }

  async getUserProfile(): Promise<{
    user: User;
    courses: CourseWithRelations[];
    enrollments: EnrollmentWithCourse[];
  }> {
    return this.fetchJson('/api/user/profile');
  }
}

export const api = new ApiClient(); 