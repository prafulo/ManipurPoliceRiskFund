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
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import type { UserRole } from '@/lib/types';


export default function FinancialSettingsPage() {
  const { toast } = useToast();
  const { data: session } = useSession();

  const [subscriptionAmount, setSubscriptionAmount] = useState<number | ''>('');
  const [expiredReleaseAmount, setExpiredReleaseAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
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

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Financial Settings</h2>
        <p className="text-muted-foreground">Manage subscription and benefit amounts.</p>
      </div>

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
