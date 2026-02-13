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
import { Hash, Save } from 'lucide-react';

export default function MembershipCodeSettingsPage() {
  const { toast } = useToast();
  const { data: session } = useSession();

  const [membershipCodeStartSerial, setMembershipCodeStartSerial] = useState<number | ''>('');
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
        
        const codeSerial = settings.find((s: any) => s.key === 'membershipCodeStartSerial');
        if (codeSerial) setMembershipCodeStartSerial(Number(codeSerial.value));
        else setMembershipCodeStartSerial(30001); // Default

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
          membershipCodeStartSerial,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save settings.');
      }

      toast({
        title: "Configuration Saved",
        description: `Membership code serial has been updated.`,
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
        <h2 className="text-3xl font-bold tracking-tight font-headline">Membership Code Configuration</h2>
        <p className="text-muted-foreground">Manage the global serial numbering system for member identification codes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Global Serial Number
          </CardTitle>
          <CardDescription>This serial number is the middle part of the generated member code (e.g. PHQ-<strong>30001</strong>-0225).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           {loading ? (
             <div className="grid w-full max-w-sm items-center gap-1.5">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-10 w-full" />
             </div>
           ) : (
             <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="start-serial">Next Available Serial Number</Label>
                <Input 
                  type="number" 
                  id="start-serial" 
                  placeholder="30001" 
                  value={membershipCodeStartSerial} 
                  onChange={(e) => setMembershipCodeStartSerial(Number(e.target.value))}
                  disabled={userRole !== 'SuperAdmin'}
                />
                <p className="text-sm text-muted-foreground pt-1">
                  Updating this value will reset the sequence globally across all units for the next member created.
                </p>
              </div>
           )}
        </CardContent>
        {userRole === 'SuperAdmin' && (
            <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSave} disabled={loading || isSaving}>
                    {isSaving ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Configuration</>}
                </Button>
            </CardFooter>
        )}
      </Card>
      
    </div>
  );
}
