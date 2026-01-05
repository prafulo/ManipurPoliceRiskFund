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
import { units as defaultUnits } from '@/lib/data';
import Link from 'next/link';
import type { Unit } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// This would come from a database in a real app
const initialSerialNumbers = defaultUnits.reduce((acc, unit) => {
  acc[unit.id] = 31000; // Default starting number
  return acc;
}, {} as Record<string, number>);


export default function SettingsPage() {
  const [amount, setAmount] = useState(100); // Default amount
  const [expiredReleaseAmount, setExpiredReleaseAmount] = useState(50000); // Default amount
  const [serialNumbers, setSerialNumbers] = useState<Record<string, number>>({});
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load units from localStorage
    const storedUnits = localStorage.getItem('units');
    const unitsData = storedUnits ? JSON.parse(storedUnits) : defaultUnits;
    setUnits(unitsData);
    setLoadingUnits(false);

    // Initialize serial numbers based on loaded units
    const storedSerials = localStorage.getItem('settings-serial');
    if (storedSerials) {
      setSerialNumbers(JSON.parse(storedSerials));
    } else {
       const defaultSerials = unitsData.reduce((acc: Record<string, number>, unit: Unit) => {
        acc[unit.id] = 31000;
        return acc;
      }, {});
      setSerialNumbers(defaultSerials);
    }
    
    // Load subscription amount
    const storedAmount = localStorage.getItem('settings-subscription-amount');
    if (storedAmount) {
      setAmount(Number(storedAmount));
    }
    
    // Load expired release amount
    const storedExpiredAmount = localStorage.getItem('settings-expired-release-amount');
    if (storedExpiredAmount) {
      setExpiredReleaseAmount(Number(storedExpiredAmount));
    }

  }, []);

  const handleSubscriptionSave = () => {
    localStorage.setItem('settings-subscription-amount', String(amount));
    toast({
      title: "Settings Saved",
      description: `The monthly subscription amount has been updated to $${amount}.`,
    });
  }

  const handleExpiredReleaseSave = () => {
    localStorage.setItem('settings-expired-release-amount', String(expiredReleaseAmount));
    toast({
      title: "Settings Saved",
      description: `The fixed release amount for expired members has been updated to $${expiredReleaseAmount}.`,
    });
  }

  const handleSerialSave = () => {
    localStorage.setItem('settings-serial', JSON.stringify(serialNumbers));
    toast({
      title: "Settings Saved",
      description: `The initial membership serial numbers have been updated.`,
    });
  }

  const handleSerialChange = (unitId: string, value: string) => {
    setSerialNumbers(prev => ({
      ...prev,
      [unitId]: Number(value)
    }));
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
          <CardTitle>Subscription Amount</CardTitle>
          <CardDescription>Set the monthly subscription amount for all members. This will apply to all future payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="amount">Monthly Amount ($)</Label>
            <Input 
              type="number" 
              id="amount" 
              placeholder="100" 
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSubscriptionSave}>Save Subscription Settings</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expired Member Release Amount</CardTitle>
          <CardDescription>Set the fixed, one-time amount released when a member's account is closed due to death.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="expired-amount">Fixed Release Amount ($)</Label>
            <Input 
              type="number" 
              id="expired-amount" 
              placeholder="50000" 
              value={expiredReleaseAmount} 
              onChange={(e) => setExpiredReleaseAmount(Number(e.target.value))}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleExpiredReleaseSave}>Save Release Amount</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Membership Code Serial Numbers</CardTitle>
          <CardDescription>Set the starting serial number for new members in each unit. This is only used if no members exist for a unit yet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           {loadingUnits ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
             </div>
           ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {units.map(unit => (
                <div key={unit.id} className="grid w-full items-center gap-1.5">
                  <Label htmlFor={`serial-${unit.id}`}>Starting No. for <span className="font-semibold">{unit.name}</span></Label>
                  <Input 
                    type="number" 
                    id={`serial-${unit.id}`}
                    value={serialNumbers[unit.id] || ''} 
                    onChange={(e) => handleSerialChange(unit.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
           )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSerialSave}>Save Serial Number Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
