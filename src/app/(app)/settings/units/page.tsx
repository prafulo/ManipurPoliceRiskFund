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
import type { Unit } from '@/lib/types';
import { Trash2, Edit, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function ManageUnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitName, setUnitName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    async function getUnits() {
        try {
            const res = await fetch('/api/units');
            const data = await res.json();
            setUnits(data.units);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch units.'})
        } finally {
            setIsLoading(false);
        }
    }
    getUnits();
  }, [toast]);

  const handleAddOrUpdateUnit = async () => {
    if (!unitName.trim()) {
        toast({ variant: 'destructive', title: 'Error', description: 'Unit name cannot be empty.' });
        return;
    }
    
    const url = editingUnit ? `/api/units/${editingUnit.id}` : '/api/units/new';
    const method = editingUnit ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: unitName })
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to save unit.');
        }

        toast({
            title: `Unit ${editingUnit ? 'Updated' : 'Added'}`,
            description: `The unit "${unitName}" has been saved.`
        });
        
        setUnitName('');
        setEditingUnit(null);
        router.refresh(); // This will trigger a re-fetch in the useEffect
        // Manually update state to see changes immediately
        const updatedUnits = await (await fetch('/api/units')).json();
        setUnits(updatedUnits.units);

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDeleteUnit = async (unitId: string, unitName: string) => {
    try {
        const res = await fetch(`/api/units/${unitId}`, { method: 'DELETE' });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to delete unit.');
        }
        toast({
            title: 'Unit Deleted',
            description: `The unit "${unitName}" has been deleted.`
        });
        setUnits(prev => prev.filter(u => u.id !== unitId));

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const startEditing = (unit: Unit) => {
    setEditingUnit(unit);
    setUnitName(unit.name);
  };

  const cancelEditing = () => {
    setEditingUnit(null);
    setUnitName('');
  };
  
  if (isLoading) {
    return <div>Loading units...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Manage Units</h2>
        <p className="text-muted-foreground">Add, edit, or remove membership units.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingUnit ? 'Edit Unit' : 'Add New Unit'}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="unit-name">Unit Name</Label>
            <Input
              id="unit-name"
              placeholder="e.g., HQ, 4MR, etc."
              value={unitName}
              onChange={e => setUnitName(e.target.value)}
            />
          </div>
          <Button onClick={handleAddOrUpdateUnit}>
            {editingUnit ? 'Update Unit' : <><PlusCircle className="mr-2 h-4 w-4" /> Add Unit</>}
          </Button>
          {editingUnit && (
            <Button variant="outline" onClick={cancelEditing}>
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Units</CardTitle>
          <CardDescription>List of all organizational units.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit Name</TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(units || []).length > 0 ? (
                units!.map(unit => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => startEditing(unit)} className="mr-2">
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
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the <strong>{unit.name}</strong> unit.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUnit(unit.id, unit.name)}>
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
                    No units found. Add one above to get started.
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
