
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname, useRouter } from 'next/navigation';

// Dynamically import the Header with SSR turned off
const Header = dynamic(() => import('./header').then(mod => mod.Header), {
  ssr: false,
  loading: () => <HeaderSkeleton />,
});

// A skeleton loader to take the place of the header while it's loading.
function HeaderSkeleton() {
    return (
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <div className="ml-auto">
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>
        </header>
    )
}

export function ClientOnlyHeader() {
  return <Header />;
}
