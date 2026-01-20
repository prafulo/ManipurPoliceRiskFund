'use client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Member, Payment, Transfer } from '@/lib/types';
import { Users, CreditCard, ArrowRightLeft } from 'lucide-react';
import { useMemo } from 'react';

interface RecentActivityProps {
  members: Member[];
  payments: Payment[];
  transfers: Transfer[];
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

export function RecentActivity({ members, payments, transfers }: RecentActivityProps) {
  
  const recentActivities = useMemo(() => {
    const newMembers = (members || [])
      .filter(m => m.createdAt)
      .map(m => ({ 
        type: 'new-member', 
        date: new Date(m.createdAt!),
        data: m,
      }));

    const newPayments = (payments || []).map(p => ({
      type: 'payment',
      date: new Date(p.paymentDate),
      data: p,
    }));

    const newTransfers = (transfers || []).map(t => ({
      type: 'transfer',
      date: new Date(t.transferDate),
      data: t,
    }));
    
    const allActivities = [...newMembers, ...newPayments, ...newTransfers];
    
    return allActivities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }, [members, payments, transfers]);


  if(recentActivities.length === 0) {
      return <div className="flex items-center justify-center h-24">
        <p className="text-sm text-muted-foreground">No recent activity to display.</p>
      </div>
  }

  return (
    <div className="space-y-6">
      {recentActivities.map((activity, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {activity.type === 'new-member' && <Users className="h-4 w-4" />}
              {activity.type === 'payment' && <CreditCard className="h-4 w-4" />}
              {activity.type === 'transfer' && <ArrowRightLeft className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.type === 'new-member' && `New Member: ${(activity.data as Member).name}`}
              {activity.type === 'payment' && `Payment from ${(activity.data as Payment).memberName}`}
              {activity.type === 'transfer' && `Transfer for ${(activity.data as Transfer).memberName}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {activity.type === 'new-member' && `Joined the fund.`}
              {activity.type === 'payment' && `Rs. ${activity.data.amount.toFixed(2)} received.`}
              {activity.type === 'transfer' && `From ${(activity.data as any).fromUnitName} to ${(activity.data as any).toUnitName}.`}
            </p>
          </div>
          <div className="ml-auto font-medium text-sm text-muted-foreground whitespace-nowrap">{timeAgo(activity.date)}</div>
        </div>
      ))}
    </div>
  );
}
