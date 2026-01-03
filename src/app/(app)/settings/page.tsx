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
import { units } from '@/lib/data';

// This would come from a database in a real app
const defaultSerialNumbers = units.reduce((acc, unit) => {
  acc[unit.id] = 31000; // Default starting number
  return acc;
}, {} as Record<string, number>);


export default function SettingsPage() {
  const [amount, setAmount] = useState(100); // Default amount
  const [serialNumbers, setSerialNumbers] = useState(defaultSerialNumbers);
  const { toast } = useToast();

  useEffect(() => {
    const storedAmount = localStorage.getItem('settings-subscription-amount');
    if (storedAmount) {
      setAmount(Number(storedAmount));
    }

    const storedSerials = localStorage.getItem('settings-serial');
    if (storedSerials) {
      setSerialNumbers(JSON.parse(storedSerials));
    }
  }, []);

  const handleSubscriptionSave = () => {
    localStorage.setItem('settings-subscription-amount', String(amount));
    toast({
      title: "Settings Saved",
      description: `The monthly subscription amount has been updated to $${amount}.`,
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
          <CardTitle>Membership Code Serial Numbers</CardTitle>
          <CardDescription>Set the starting serial number for new members in each unit. The system will auto-increment from the last used number for that unit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSerialSave}>Save Serial Number Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
