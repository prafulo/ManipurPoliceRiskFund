'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { units as defaultUnits } from '@/lib/data';
import type { Unit } from '@/lib/types';
import { Trash2, Edit, PlusCircle } from 'lucide-react';

export default function ManageUnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitName, setUnitName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedUnits = localStorage.getItem('units');
    if (storedUnits) {
      setUnits(JSON.parse(storedUnits));
    } else {
      localStorage.setItem('units', JSON.stringify(defaultUnits));
      setUnits(defaultUnits);
    }
    setIsLoading(false);
  }, []);

  const saveUnits = (updatedUnits: Unit[]) => {
    setUnits(updatedUnits);
    localStorage.setItem('units', JSON.stringify(updatedUnits));
  };

  const handleAddOrUpdateUnit = () => {
    if (!unitName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Unit name cannot be empty.' });
      return;
    }

    if (editingUnit) {
      // Update
      const updatedUnits = units.map(u => u.id === editingUnit.id ? { ...u, name: unitName.trim() } : u);
      saveUnits(updatedUnits);
      toast({ title: 'Unit Updated', description: `Unit "${unitName}" has been updated.` });
    } else {
      // Add
      const newUnit: Unit = {
        id: new Date().getTime().toString(),
        name: unitName.trim(),
      };
      const updatedUnits = [...units, newUnit];
      saveUnits(updatedUnits);
      toast({ title: 'Unit Added', description: `Unit "${unitName}" has been added.` });
    }

    setUnitName('');
    setEditingUnit(null);
  };

  const handleDeleteUnit = (unitId: string) => {
    // Check if unit is in use by members
    const membersString = localStorage.getItem('members');
    const members = membersString ? JSON.parse(membersString) : [];
    const isUnitInUse = members.some((m: any) => m.unitId === unitId);

    if (isUnitInUse) {
      toast({
        variant: 'destructive',
        title: 'Cannot Delete Unit',
        description: 'This unit is currently assigned to one or more members.',
      });
      return;
    }

    const updatedUnits = units.filter(u => u.id !== unitId);
    saveUnits(updatedUnits);
    toast({ title: 'Unit Deleted', description: 'The unit has been removed.' });
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
              {units.length > 0 ? (
                units.map(unit => (
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
                              <AlertDialogAction onClick={() => handleDeleteUnit(unit.id)}>
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
