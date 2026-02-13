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
import { Save } from 'lucide-react';


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
        description: `Financial settings have been updated successfully.`,
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
        <p className="text-muted-foreground">Manage subscription amounts and benefit release configurations.</p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Global Rates</CardTitle>
          <CardDescription>Manage the standard amounts used across the system.</CardDescription>
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
                </div>
             </div>
          ): (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="grid w-full items-center gap-1.5">
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

               <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="expired-amount">Expired Member Release Amount (₹)</Label>
                <Input 
                  type="number" 
                  id="expired-amount" 
                  placeholder="50000" 
                  value={expiredReleaseAmount} 
                  onChange={(e) => setExpiredReleaseAmount(Number(e.target.value))}
                  disabled={userRole !== 'SuperAdmin'}
                />
              </div>
            </div>
          )}
        </CardContent>
        {userRole === 'SuperAdmin' && (
            <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSave} disabled={loading || isSaving}>
                    {isSaving ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Financial Settings</>}
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
