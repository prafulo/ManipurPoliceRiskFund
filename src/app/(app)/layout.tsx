'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { ClientOnlyHeader } from '@/components/layout/client-only-header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function AppSkeleton() {
  return (
    <div className="grid h-screen w-full md:grid-cols-[256px_1fr]">
      {/* Sidebar Skeleton */}
      <div className="hidden md:flex w-64 flex-col bg-card border-r p-6 space-y-8">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex-1 px-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <div className="flex flex-col overflow-hidden">
        {/* Header Skeleton */}
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
            <div className="flex w-full items-center gap-4 md:ml-auto">
                <div className="ml-auto flex items-center gap-2">
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>
        </header>
        {/* Main Content Skeleton */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-y-auto">
          <Skeleton className="h-96 w-full rounded-lg" />
        </main>
      </div>
    </div>
  );
}


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading' || !session) {
    return <AppSkeleton />;
  }

  return (
    <div className="grid h-screen w-full md:grid-cols-[256px_1fr]">
      <Sidebar />
      <div className="flex flex-col overflow-hidden">
        <ClientOnlyHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
