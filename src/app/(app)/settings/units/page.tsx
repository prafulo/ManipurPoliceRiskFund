'use client';

import { useState } from 'react';
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
import type { Unit, Member } from '@/lib/types';
import { Trash2, Edit, PlusCircle } from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';


export default function ManageUnitsPage() {
  const firestore = useFirestore();
  const { data: units, loading: isLoading, error } = useCollection<Unit>(
    firestore ? collection(firestore, 'units') : null
  );

  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitName, setUnitName] = useState('');
  const { toast } = useToast();

  const handleAddOrUpdateUnit = async () => {
    if (!firestore || !unitName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Unit name cannot be empty.' });
      return;
    }

    try {
        if (editingUnit) {
          // Update
          const unitRef = doc(firestore, 'units', editingUnit.id);
          await updateDoc(unitRef, { name: unitName.trim() });
          toast({ title: 'Unit Updated', description: `Unit "${unitName}" has been updated.` });
        } else {
          // Add
          await addDoc(collection(firestore, 'units'), { name: unitName.trim() });
          toast({ title: 'Unit Added', description: `Unit "${unitName}" has been added.` });
        }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save the unit.' });
    }

    setUnitName('');
    setEditingUnit(null);
  };

  const handleDeleteUnit = async (unitId: string, unitName: string) => {
    if (!firestore) return;

    // Check if unit is in use by members
    const membersRef = collection(firestore, 'members');
    const q = query(membersRef, where('unitId', '==', unitId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      toast({
        variant: 'destructive',
        title: 'Cannot Delete Unit',
        description: `This unit is currently assigned to ${querySnapshot.size} member(s).`,
      });
      return;
    }
    
    try {
        await deleteDoc(doc(firestore, 'units', unitId));
        toast({ title: 'Unit Deleted', description: `The unit "${unitName}" has been removed.` });
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the unit.' });
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

  if (error) {
    return <div>Error loading units: {error.message}</div>;
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
                    No units found.
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
