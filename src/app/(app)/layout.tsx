'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { useAuth } from '@/contexts/auth-context';
import { ClientOnlyHeader } from '@/components/layout/client-only-header';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading application...</p>
        </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <ClientOnlyHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
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
  return (
      <ProtectedLayout>
          {children}
      </ProtectedLayout>
  );
}
