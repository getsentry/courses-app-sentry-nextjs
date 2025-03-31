// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in development
  // Adjust this value in production, recommended 0.2 (20%) for production
  // tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Session Replay
  replaysOnErrorSampleRate: 1.0, // Capture all sessions where errors occur
  replaysSessionSampleRate: 0.1,  // Capture 10% of all sessions

  // Debugging in development
  debug: process.env.NODE_ENV === 'development',

  // Configure allowed domains for tracing
  tracePropagationTargets: [
    'localhost',
  ],
});
