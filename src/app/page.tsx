'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Logo } from '@/components/logo';

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="relative flex items-center justify-center">
            <Logo className="w-24 h-24" />
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        </div>
        <p className="mt-4 text-lg text-muted-foreground animate-pulse">Loading Application...</p>
    </div>
  );
}
