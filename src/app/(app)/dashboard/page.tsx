import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, UserCheck, UserX, Landmark } from 'lucide-react';
import { members } from '@/lib/data';

const stats = {
  totalMembers: members.length,
  activeMembers: members.filter(m => m.status === 'Opened' && !m.isDoubling).length,
  closedMembers: members.filter(m => m.status === 'Closed').length,
  totalUnits: new Set(members.map(m => m.unitId)).size
};

export default function Dashboard() {
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
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">New member added</p>
                  <p className="text-sm text-muted-foreground">John Doe (1MR-31000-0724)</p>
                </div>
                <div className="ml-auto font-medium text-sm text-muted-foreground">1 day ago</div>
              </div>
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Membership closed</p>
                  <p className="text-sm text-muted-foreground">Mary Smith (1MR-31002-0624)</p>
                </div>
                <div className="ml-auto font-medium text-sm text-muted-foreground">2 days ago</div>
              </div>
               <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Subscription payment</p>
                  <p className="text-sm text-muted-foreground">Peter Jones (2MR-31001-0724)</p>
                </div>
                <div className="ml-auto font-medium text-sm text-muted-foreground">3 days ago</div>
              </div>
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
