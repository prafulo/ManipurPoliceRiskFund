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
import { Save, PenTool } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SigState {
    name: string;
    designation: string;
    organization: string;
}

export default function SignatureSettingsPage() {
  const { toast } = useToast();
  const { data: session } = useSession();

  const [sig1, setSig1] = useState<SigState>({ name: '', designation: '', organization: '' });
  const [sig2, setSig2] = useState<SigState>({ name: '', designation: '', organization: '' });
  const [sig3, setSig3] = useState<SigState>({ name: '', designation: '', organization: '' });
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const userRole = session?.user?.role as UserRole;

  useEffect(() => {
    async function fetchSignatures() {
      setLoading(true);
      try {
        const res = await fetch('/api/signature');
        if (!res.ok) throw new Error('Failed to fetch signatures');
        const data = await res.json();
        
        if (data.sig1) setSig1(data.sig1);
        if (data.sig2) setSig2(data.sig2);
        if (data.sig3) setSig3(data.sig3);

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
    fetchSignatures();
  }, [toast]);


  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sig1, sig2, sig3 }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save signatures.');
      }

      toast({
        title: "Signatures Saved",
        description: `All report authority details have been updated successfully.`,
      });

    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Error Saving Signatures',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  const updateSig = (slot: 'sig1' | 'sig2' | 'sig3', field: keyof SigState, value: string) => {
      if (slot === 'sig1') setSig1(prev => ({ ...prev, [field]: value }));
      if (slot === 'sig2') setSig2(prev => ({ ...prev, [field]: value }));
      if (slot === 'sig3') setSig3(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
      return (
          <div className="space-y-8 max-w-4xl">
              <Skeleton className="h-10 w-64" />
              <Card><CardContent className="p-8 space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></CardContent></Card>
          </div>
      );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline text-primary">Report Signature Settings</h2>
        <p className="text-muted-foreground">Configure up to three authority signatures for official reports.</p>
      </div>

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-primary" />
            Authority Assignments
          </CardTitle>
          <CardDescription>Enter the details for each official in the order they should appear.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">
          
          {/* Slot 1 */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase text-primary border-l-4 border-primary pl-2">1st Authority Details</h4>
            <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1.5"><Label>Officer Name</Label><Input value={sig1.name} onChange={e => updateSig('sig1', 'name', e.target.value)} placeholder="XYZ" /></div>
                <div className="space-y-1.5"><Label>Designation</Label><Input value={sig1.designation} onChange={e => updateSig('sig1', 'designation', e.target.value)} placeholder="SECRETARY CUM TREASURER" /></div>
                <div className="space-y-1.5"><Label>Organization</Label><Input value={sig1.organization} onChange={e => updateSig('sig1', 'organization', e.target.value)} placeholder="MANIPUR POLICE RISK FUND" /></div>
            </div>
          </div>

          <Separator />

          {/* Slot 2 */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase text-primary border-l-4 border-primary pl-2">2nd Authority Details</h4>
            <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1.5"><Label>Officer Name</Label><Input value={sig2.name} onChange={e => updateSig('sig2', 'name', e.target.value)} placeholder="PQR" /></div>
                <div className="space-y-1.5"><Label>Designation</Label><Input value={sig2.designation} onChange={e => updateSig('sig2', 'designation', e.target.value)} placeholder="COMMANDANT" /></div>
                <div className="space-y-1.5"><Label>Organization</Label><Input value={sig2.organization} onChange={e => updateSig('sig2', 'organization', e.target.value)} placeholder="SIGNATURE WITH OFFICIAL SEAL" /></div>
            </div>
          </div>

          <Separator />

          {/* Slot 3 */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase text-primary border-l-4 border-primary pl-2">3rd Authority Details</h4>
            <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1.5"><Label>Officer Name</Label><Input value={sig3.name} onChange={e => updateSig('sig3', 'name', e.target.value)} placeholder="LMN" /></div>
                <div className="space-y-1.5"><Label>Designation</Label><Input value={sig3.designation} onChange={e => updateSig('sig3', 'designation', e.target.value)} placeholder="DIG (TELECOM)" /></div>
                <div className="space-y-1.5"><Label>Organization</Label><Input value={sig3.organization} onChange={e => updateSig('sig3', 'organization', e.target.value)} placeholder="MANIPUR POLICE COMPUTER CENTRE" /></div>
            </div>
          </div>

        </CardContent>
        {userRole === 'SuperAdmin' && (
            <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSave} disabled={loading || isSaving}>
                    {isSaving ? 'Saving Changes...' : <><Save className="mr-2 h-4 w-4" /> Save All Signatures</>}
                </Button>
            </CardFooter>
        )}
      </Card>

      <div className="p-8 bg-muted/20 rounded-lg border border-dashed">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8 text-center">Print Footer Preview</h4>
          <div className="grid grid-cols-3 gap-8">
              <div className="text-center space-y-1">
                  <p className="font-bold text-sm">{sig1.name || 'Authority 1'}</p>
                  <p className="text-[10px] uppercase">{sig1.designation}</p>
                  <p className="text-[10px] uppercase">{sig1.organization}</p>
              </div>
              <div className="text-center space-y-1">
                  <p className="font-bold text-sm">{sig2.name || 'Authority 2'}</p>
                  <p className="text-[10px] uppercase">{sig2.designation}</p>
                  <p className="text-[10px] uppercase">{sig2.organization}</p>
              </div>
              <div className="text-center space-y-1">
                  <p className="font-bold text-sm">{sig3.name || 'Authority 3'}</p>
                  <p className="text-[10px] uppercase">{sig3.designation}</p>
                  <p className="text-[10px] uppercase">{sig3.organization}</p>
              </div>
          </div>
      </div>
      
    </div>
  );
}
