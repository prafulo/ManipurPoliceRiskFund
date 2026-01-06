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
import type { Unit } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore, useCollection, useDoc } from '@/firebase/hooks';
import { doc, setDoc, getDoc, collection } from 'firebase/firestore';


export default function SettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const { data: units, loading: unitsLoading } = useCollection<Unit>(
    firestore ? collection(firestore, 'units') : null
  );

  const [subscriptionAmount, setSubscriptionAmount] = useState<number | ''>('');
  const [expiredReleaseAmount, setExpiredReleaseAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      if (!firestore) return;
      setLoading(true);
      const settingsRef = doc(firestore, 'settings', 'global');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        setSubscriptionAmount(data.subscriptionAmount || '');
        setExpiredReleaseAmount(data.expiredReleaseAmount || '');
      } else {
        setSubscriptionAmount(100);
        setExpiredReleaseAmount(50000);
      }
      setLoading(false);
    }
    loadSettings();
  }, [firestore]);


  const handleSave = async () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
      return;
    }
    try {
      const settingsRef = doc(firestore, 'settings', 'global');
      await setDoc(settingsRef, { 
        subscriptionAmount: Number(subscriptionAmount),
        expiredReleaseAmount: Number(expiredReleaseAmount)
      }, { merge: true });
      toast({
        title: "Settings Saved",
        description: `Settings have been updated successfully.`,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save settings.' });
    }
  }


  return (
    <div className="space-y-8 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Settings</h2>
        <p className="text-muted-foreground">Manage application-wide settings.</p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Financial Settings</CardTitle>
          <CardDescription>Manage subscription and benefit amounts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
             <div className="space-y-6">
                <Skeleton className="h-16 w-1/2" />
                <Skeleton className="h-16 w-1/2" />
             </div>
          ): (
            <>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="amount">Monthly Subscription Amount ($)</Label>
                <Input 
                  type="number" 
                  id="amount" 
                  placeholder="100" 
                  value={subscriptionAmount} 
                  onChange={(e) => setSubscriptionAmount(Number(e.target.value))}
                />
              </div>

               <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="expired-amount">Expired Member Release Amount ($)</Label>
                <Input 
                  type="number" 
                  id="expired-amount" 
                  placeholder="50000" 
                  value={expiredReleaseAmount} 
                  onChange={(e) => setExpiredReleaseAmount(Number(e.target.value))}
                />
                 <p className="text-sm text-muted-foreground pt-1">The fixed, one-time amount released when a member's account is closed due to death.</p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave} disabled={loading}>Save Financial Settings</Button>
        </CardFooter>
      </Card>
      
    </div>
  );
}
