'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Rank } from '@/lib/types';
import { Trash2, Edit, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ManageRanksPage() {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [rankName, setRankName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    async function getRanks() {
        try {
            const res = await fetch('/api/ranks');
            const data = await res.json();
            setRanks(data.ranks);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch ranks.'})
        } finally {
            setIsLoading(false);
        }
    }
    getRanks();
  }, [toast]);

  const handleAddOrUpdateRank = async () => {
    if (!rankName.trim()) {
        toast({ variant: 'destructive', title: 'Error', description: 'Rank name cannot be empty.' });
        return;
    }
    
    const url = editingRank ? `/api/ranks/${editingRank.id}` : '/api/ranks/new';
    const method = editingRank ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: rankName })
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to save rank.');
        }

        toast({
            title: `Rank ${editingRank ? 'Updated' : 'Added'}`,
            description: `The rank "${rankName}" has been saved.`
        });
        
        setRankName('');
        setEditingRank(null);
        
        const updatedRanks = await (await fetch('/api/ranks')).json();
        setRanks(updatedRanks.ranks);

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDeleteRank = async (rankId: string, rankName: string) => {
    try {
        const res = await fetch(`/api/ranks/${rankId}`, { method: 'DELETE' });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to delete rank.');
        }
        toast({
            title: 'Rank Deleted',
            description: `The rank "${rankName}" has been deleted.`
        });
        setRanks(prev => prev.filter(r => r.id !== rankId));

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const startEditing = (rank: Rank) => {
    setEditingRank(rank);
    setRankName(rank.name);
  };

  const cancelEditing = () => {
    setEditingRank(null);
    setRankName('');
  };
  
  if (isLoading) {
    return <div>Loading ranks...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Manage Ranks</h2>
        <p className="text-muted-foreground">Maintain the list of ranks available for member profiles.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingRank ? 'Edit Rank' : 'Add New Rank'}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="rank-name">Rank Name</Label>
            <Input
              id="rank-name"
              placeholder="e.g., Sergeant, Sub-Inspector, etc."
              value={rankName}
              onChange={e => setRankName(e.target.value)}
            />
          </div>
          <Button onClick={handleAddOrUpdateRank}>
            {editingRank ? 'Update Rank' : <><PlusCircle className="mr-2 h-4 w-4" /> Add Rank</>}
          </Button>
          {editingRank && (
            <Button variant="outline" onClick={cancelEditing}>
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Ranks</CardTitle>
          <CardDescription>All defined ranks in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank Name</TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(ranks || []).length > 0 ? (
                ranks!.map(rank => (
                  <TableRow key={rank.id}>
                    <TableCell className="font-medium">{rank.name}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => startEditing(rank)} className="mr-2">
                            <Edit className="h-4 w-4" />
                        </Button>

                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Rank?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the rank <strong>{rank.name}</strong>? Existing members will retain this rank as text, but it won't be available for new selections.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteRank(rank.id, rank.name)}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    No ranks found. Add one above to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
