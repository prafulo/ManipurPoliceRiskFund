'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (session) {
      router.replace('/dashboard'); // If session exists, go to dashboard
    } else {
      router.replace('/login'); // If no session, go to login
    }
  }, [session, status, router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
    </div>
  );
}
