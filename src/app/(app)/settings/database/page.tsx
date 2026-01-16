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
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Wifi, Database } from 'lucide-react';
import type { UserRole } from '@/lib/types';


export default function DatabaseSettingsPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  
  const userRole = session?.user?.role as UserRole;
  
  useEffect(() => {
    if (session && userRole !== 'SuperAdmin') {
        router.replace('/dashboard');
    }
  }, [session, userRole, router]);

  if (!session || userRole !== 'SuperAdmin') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading application...</p>
        </div>
      );
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
        <h2 className="text-3xl font-bold tracking-tight font-headline">Database Management</h2>
        <p className="text-muted-foreground">Manage and verify your database connection and schema.</p>
      </div>
      
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
    </div>
  );
}
