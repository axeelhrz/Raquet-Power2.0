'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function AuthDebug() {
  const { user, loading } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs z-50">
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>User: {user ? user.email : 'None'}</div>
      <div>Auth Status: {user ? '✅ Authenticated' : '❌ Not Authenticated'}</div>
    </div>
  );
}