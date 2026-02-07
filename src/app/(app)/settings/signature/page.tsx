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

export default function SignatureSettingsPage() {
  const { toast } = useToast();
  const { data: session } = useSession();

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const userRole = session?.user?.role as UserRole;

  useEffect(() => {
    async function fetchSignature() {
      setLoading(true);
      try {
        const res = await fetch('/api/signature');
        if (!res.ok) throw new Error('Failed to fetch signature');
        const data = await res.json();
        
        setName(data.name || '');
        setDesignation(data.designation || '');
        setOrganization(data.organization || '');

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
    fetchSignature();
  }, [toast]);


  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, designation, organization }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save signature.');
      }

      toast({
        title: "Signature Saved",
        description: `The report signature has been updated successfully.`,
      });

    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Error Saving Signature',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Report Signature</h2>
        <p className="text-muted-foreground">Manage the authority details displayed at the bottom of printed reports.</p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Authority Details</CardTitle>
          <CardDescription>Enter the details of the official authorized to sign system reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
             <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="grid w-full max-w-sm items-center gap-1.5">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
             </div>
          ): (
            <>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="name">Officer Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. (Ningshen Worngam), IPS" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  disabled={userRole !== 'SuperAdmin'}
                />
              </div>

               <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="designation">Designation</Label>
                <Input 
                  id="designation" 
                  placeholder="e.g. Dy. IG of Police (Telecom)" 
                  value={designation} 
                  onChange={(e) => setDesignation(e.target.value)}
                  disabled={userRole !== 'SuperAdmin'}
                />
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="organization">Organization / Location</Label>
                <Input 
                  id="organization" 
                  placeholder="e.g. Manipur, Imphal." 
                  value={organization} 
                  onChange={(e) => setOrganization(e.target.value)}
                  disabled={userRole !== 'SuperAdmin'}
                />
              </div>
            </>
          )}
        </CardContent>
        {userRole === 'SuperAdmin' && (
            <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSave} disabled={loading || isSaving}>
                    {isSaving ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Signature Details</>}
                </Button>
            </CardFooter>
        )}
      </Card>

      <div className="p-6 bg-muted/30 rounded-lg border border-dashed">
          <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Preview</h4>
          <div className="text-right max-w-sm ml-auto">
              <p className="font-bold">{name || 'Officer Name'}</p>
              <p>{designation || 'Designation'}</p>
              <p>{organization || 'Organization'}</p>
          </div>
      </div>
      
    </div>
  );
}
