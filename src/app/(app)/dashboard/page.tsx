'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, UserCheck, UserX, Landmark } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import type { Member, Unit } from '@/lib/types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useEffect, useState }from 'react';

export default function Dashboard() {
  const firestore = useFirestore();
  const { data: members, loading: membersLoading } = useCollection<Member>(
    firestore ? collection(firestore, 'members') : null
  );
  const { data: units, loading: unitsLoading } = useCollection<Unit>(
    firestore ? collection(firestore, 'units') : null
  );
  
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentActivity() {
      if (!firestore) return;
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentMembersQuery = query(
          collection(firestore, 'members'),
          where('allotmentDate', '>=', sevenDaysAgo)
        );
        const recentMembersSnapshot = await getDocs(recentMembersQuery);
        const newMembers = recentMembersSnapshot.docs.map(doc => ({
            type: 'New member added',
            description: `${doc.data().name} (${doc.data().membershipCode})`,
            date: doc.data().allotmentDate.toDate(),
        }));

        const recentClosedQuery = query(
          collection(firestore, 'members'),
          where('status', '==', 'Closed'),
          where('dateOfDischarge', '>=', sevenDaysAgo)
        );
        const recentClosedSnapshot = await getDocs(recentClosedQuery);
        const closedMembers = recentClosedSnapshot.docs.map(doc => ({
            type: 'Membership closed',
            description: `${doc.data().name} (${doc.data().membershipCode})`,
            date: doc.data().dateOfDischarge.toDate(),
        }));
        
        const recentPaymentsQuery = query(
          collection(firestore, 'payments'),
          where('paymentDate', '>=', sevenDaysAgo)
        );
        const recentPaymentsSnapshot = await getDocs(recentPaymentsQuery);
        const newPayments = recentPaymentsSnapshot.docs.map(doc => ({
            type: 'Subscription payment',
            description: `${doc.data().memberName} (${doc.data().membershipCode})`,
            date: doc.data().paymentDate.toDate(),
        }));


        const allActivity = [...newMembers, ...closedMembers, ...newPayments];
        allActivity.sort((a,b) => b.date.getTime() - a.date.getTime());
        setRecentActivity(allActivity.slice(0, 5));

      } catch (error) {
        console.error("Error fetching recent activity:", error);
      } finally {
        setActivityLoading(false);
      }
    }

    fetchRecentActivity();

  }, [firestore]);


  const stats = {
    totalMembers: members?.length ?? 0,
    activeMembers: members?.filter(m => m.status === 'Opened').length ?? 0,
    closedMembers: members?.filter(m => m.status === 'Closed').length ?? 0,
    totalUnits: units?.length ?? 0,
  };

  const loading = membersLoading || unitsLoading;

  if (loading) {
    return <div>Loading dashboard...</div>;
  }
  
  function timeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  }

  return (
    <div className="flex-1 space-y-4">
       <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">All time registered members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground">Currently subscribed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Members</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.closedMembers}</div>
            <p className="text-xs text-muted-foreground">Retired, Expelled, etc.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnits}</div>
            <p className="text-xs text-muted-foreground">Across the organization</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-6">
            <div className="space-y-4">
             {activityLoading ? (
                <p>Loading activity...</p>
              ) : recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div className="flex items-center" key={index}>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <div className="ml-auto font-medium text-sm text-muted-foreground">
                      {timeAgo(activity.date)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Subscription Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">Chart component would go here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
