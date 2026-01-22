'use client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Activity } from '@/lib/types';
import { Users, CreditCard, ArrowRightLeft } from 'lucide-react';
import { useMemo } from 'react';

interface RecentActivityProps {
  activities: Activity[];
}

function timeAgo(date: Date | string) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

export function RecentActivity({ activities }: RecentActivityProps) {
  
  const recentActivities = useMemo(() => {
    return (activities || []).slice(0, 5);
  }, [activities]);


  if(recentActivities.length === 0) {
      return <div className="flex items-center justify-center h-24">
        <p className="text-sm text-muted-foreground">No recent activity to display.</p>
      </div>
  }

  return (
    <div className="space-y-6">
      {recentActivities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {activity.type === 'new-member' && <Users className="h-4 w-4" />}
              {activity.type === 'payment' && <CreditCard className="h-4 w-4" />}
              {activity.type === 'transfer' && <ArrowRightLeft className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {activity.details}
            </p>
          </div>
          <div className="ml-auto font-medium text-sm text-muted-foreground whitespace-nowrap">{timeAgo(activity.date)}</div>
        </div>
      ))}
    </div>
  );
}
