'use client';

import { useEffect } from 'react';

export default function DevTools() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Dynamically import debug utilities
      import('@/utils/testCsrf');
      import('@/utils/debugCsrf');
    }
  }, []);

  return null;
}