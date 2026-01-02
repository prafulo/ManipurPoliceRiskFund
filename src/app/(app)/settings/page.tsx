'use client';
import { useState } from 'react';
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

export default function SettingsPage() {
  const [amount, setAmount] = useState(100); // Default amount
  const { toast } = useToast();

  const handleSave = () => {
    // In a real app, this would be a server action to update the setting
    console.log("Saving new amount:", amount);
    toast({
      title: "Settings Saved",
      description: `The monthly subscription amount has been updated to $${amount}.`,
    });
  }

  return (
    <div className="max-w-2xl">
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
          <Button onClick={handleSave}>Save Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
