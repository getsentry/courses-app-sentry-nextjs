# Course Management System

A Next.js application for creating and managing courses. Built with TypeScript, Prisma, tRPC, PostgreSQL, and NextAuth.js.

## Features

- User authentication (sign up, sign in)
- Course creation and management
- Course syllabus management
- Responsive design with Tailwind CSS
- Form validation with Zod
- Type-safe development with TypeScript
- Sentry integration

## Prerequisites

- Node.js 18.x or later
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository:
2. Install dependencies:
    ```bash
    npm install
    ```
3. Configure environment variables:
    - Copy `env.example` to `.env`
    - Update the following variables:
        - `DATABASE_URL`: Your PostgreSQL connection string (the default should work fine)
        - `NEXTAUTH_SECRET`: A random string for NextAuth.js
        - `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
        - `NEXT_PUBLIC_SENTRY_DSN`: The DSN for your Sentry project
4. Set up the database:
    ```bash
    # Create a PostgreSQL database named 'courses_db'
    createdb courses_db

    # Run Prisma migrations
    npx prisma migrate dev

    # Seed DB with starter data
    npx prisma db seed
    ```
5. Build and run the production server:
    ```bash
    npm run build
    npm run start
    ```
The application will be available at http://localhost:3000.
