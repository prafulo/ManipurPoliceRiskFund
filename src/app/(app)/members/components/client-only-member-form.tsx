'use client';

import dynamic from 'next/dynamic';
import type { Member } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const MemberForm = dynamic(() => import('./member-form').then(mod => mod.MemberForm), {
  ssr: false,
  loading: () => (
      <div className="space-y-8 p-8">
        <Skeleton className="h-10 w-1/3" />
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
         <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      </div>
  )
});

export function ClientOnlyMemberForm({ member }: { member?: Member }) {
  return <MemberForm member={member} />;
}
