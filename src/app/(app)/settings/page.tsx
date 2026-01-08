'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Wifi, Database, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { UserRole } from '@/lib/types';


export default function SettingsPage() {
  const { toast } = useToast();
  const { data: session } = useSession();

  const [subscriptionAmount, setSubscriptionAmount] = useState<number | ''>('');
  const [expiredReleaseAmount, setExpiredReleaseAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  
  const userRole = session?.user?.role as UserRole;

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) throw new Error('Failed to fetch settings');
        const settings = await res.json();
        
        const subAmount = settings.find((s: any) => s.key === 'subscriptionAmount');
        if (subAmount) setSubscriptionAmount(Number(subAmount.value));

        const expiredAmount = settings.find((s: any) => s.key === 'expiredReleaseAmount');
        if (expiredAmount) setExpiredReleaseAmount(Number(expiredAmount.value));

      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);


  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionAmount,
          expiredReleaseAmount,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save settings.');
      }

      toast({
        title: "Settings Saved",
        description: `Settings have been updated successfully.`,
      });

    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Error Saving Settings',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  const handleTestConnection = async () => {
    setIsTestingDb(true);
    try {
        const res = await fetch('/api/db-test');
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'An unknown error occurred.');
        }

        toast({
            title: 'Success',
            description: data.message,
            className: 'bg-green-100 text-green-900 border-green-300',
        });

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Connection Failed',
            description: error.message,
        });
    } finally {
        setIsTestingDb(false);
    }
  }

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const res = await fetch('/api/migrate', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'An unknown error occurred during migration.');
      }

      toast({
        title: "Database Update Successful",
        description: data.stdout || 'The database schema is now in sync.',
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Database Update Failed',
        description: error.message,
      });
    } finally {
      setIsMigrating(false);
    }
  }


  return (
    <div className="space-y-8 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Settings</h2>
        <p className="text-muted-foreground">Manage application-wide settings.</p>
      </div>
      
      {userRole === 'SuperAdmin' && (
        <Card>
            <CardHeader>
                <CardTitle>Database Management</CardTitle>
                <CardDescription>Manage and verify your database connection and schema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div>
                <h4 className="font-medium">Test Connection</h4>
                <p className="text-sm text-muted-foreground pt-1">Verify that the application can successfully connect to the MySQL database.</p>
            </div>
            <div>
                <h4 className="font-medium">Update Schema</h4>
                <p className="text-sm text-muted-foreground pt-1">Sync your database with the current Prisma schema. This will apply any pending changes.</p>
            </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex gap-4">
                <Button onClick={handleTestConnection} disabled={isTestingDb} variant="outline">
                    {isTestingDb ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div> : <Wifi />}
                    {isTestingDb ? 'Testing...' : 'Test Database Connection'}
                </Button>
                <Button onClick={handleMigrate} disabled={isMigrating}>
                    {isMigrating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div> : <Database />}
                    {isMigrating ? 'Updating...' : 'Setup/Update Database'}
                </Button>
            </CardFooter>
        </Card>
      )}


       <Card>
        <CardHeader>
          <CardTitle>Manage Units</CardTitle>
          <CardDescription>Add, edit, or remove membership units for the organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Use the dedicated units management page to update organizational units.</p>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Link href="/settings/units">
            <Button variant="outline">Manage Units</Button>
          </Link>
        </CardFooter>
      </Card>
      
      {userRole === 'SuperAdmin' && (
         <Card>
            <CardHeader>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>Add, edit, or remove user accounts and manage their roles.</CardDescription>
            </CardHeader>
            <CardContent>
            <p className="text-sm text-muted-foreground">Control who can access the application and what they can do.</p>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Link href="/settings/users">
                    <Button variant="outline"><Users className="mr-2"/>Manage Users</Button>
                </Link>
            </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Financial Settings</CardTitle>
          <CardDescription>Manage subscription and benefit amounts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
             <div className="space-y-6">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-full mt-1" />
                </div>
             </div>
          ): (
            <>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="amount">Monthly Subscription Amount (₹)</Label>
                <Input 
                  type="number" 
                  id="amount" 
                  placeholder="100" 
                  value={subscriptionAmount} 
                  onChange={(e) => setSubscriptionAmount(Number(e.target.value))}
                  disabled={userRole !== 'SuperAdmin'}
                />
              </div>

               <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="expired-amount">Expired Member Release Amount (₹)</Label>
                <Input 
                  type="number" 
                  id="expired-amount" 
                  placeholder="50000" 
                  value={expiredReleaseAmount} 
                  onChange={(e) => setExpiredReleaseAmount(Number(e.target.value))}
                  disabled={userRole !== 'SuperAdmin'}
                />
                 <p className="text-sm text-muted-foreground pt-1">The fixed, one-time amount released when a member's account is closed due to death.</p>
              </div>
            </>
          )}
        </CardContent>
        {userRole === 'SuperAdmin' && (
            <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSave} disabled={loading || isSaving}>
                    {isSaving ? 'Saving...' : 'Save Financial Settings'}
                </Button>
            </CardFooter>
        )}
      </Card>
      
    </div>
  );
}
