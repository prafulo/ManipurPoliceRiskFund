'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, UserCheck, UserX, Landmark } from 'lucide-react';
import type { Member, Unit, Activity } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { RecentActivity } from './components/recent-activity';
import { UnitSubscriptionChart } from './components/unit-pie-chart';

async function fetchData() {
  const [membersRes, unitsRes, activitiesRes] = await Promise.all([
    fetch('/api/members'),
    fetch('/api/units'),
    fetch('/api/activities') // Fetches last 3 months by default
  ]);
  const [membersData, unitsData, activitiesData] = await Promise.all([
    membersRes.json(),
    unitsRes.json(),
    activitiesRes.json()
  ]);
  return { 
    members: membersData.members, 
    units: unitsData.units,
    activities: activitiesData.activities
  };
}

function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-4">
       <Skeleton className="h-9 w-64 mb-4" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-32 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
          </CardHeader>
          <CardContent className="pl-6">
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function Dashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { members, units, activities } = await fetchData();
        setMembers(members || []);
        setUnits(units || []);
        setActivities(activities || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = {
    totalMembers: members?.length ?? 0,
    activeMembers: members?.filter(m => m.status === 'Opened').length ?? 0,
    closedMembers: members?.filter(m => m.status === 'Closed').length ?? 0,
    totalUnits: units?.length ?? 0,
  };

  if (loading) {
    return <DashboardSkeleton />;
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
            <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Link href="/recent-activity" passHref>
                    <Button variant="link" className="pr-0 h-auto p-0 text-sm">View all</Button>
                </Link>
            </div>
          </CardHeader>
          <CardContent className="pl-6">
            <RecentActivity activities={activities} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Subscription Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <UnitSubscriptionChart members={members} units={units} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
