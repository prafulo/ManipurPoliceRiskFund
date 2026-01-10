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
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { users as User, units as Unit, UserRole } from '@/lib/types';
import { Trash2, Edit, UserPlus, X, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';
import bcrypt from 'bcryptjs';


type UserWithUnitName = User & { unitName?: string };

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserWithUnitName[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [editingUser, setEditingUser] = useState<UserWithUnitName | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('UnitAdmin');
  const [unitId, setUnitId] = useState<string | undefined>(undefined);
  
  const { toast } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    async function getData() {
        if (session?.user.role !== 'SuperAdmin') {
            router.replace('/dashboard');
            return;
        }
        try {
            const [usersRes, unitsRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/units')
            ]);
            const usersData = await usersRes.json();
            const unitsData = await unitsRes.json();

            const unitsMap = new Map(unitsData.units.map((u: Unit) => [u.id, u.name]));
            const enrichedUsers = usersData.users.map((user: User) => ({
                ...user,
                unitName: user.unitId ? unitsMap.get(user.unitId) : undefined
            }));

            setUsers(enrichedUsers);
            setUnits(unitsData.units);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch data.'})
        } finally {
            setIsLoading(false);
        }
    }
    if (session) {
      getData();
    }
  }, [toast, router, session]);
  
  const resetForm = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setRole('UnitAdmin');
    setUnitId(undefined);
  }

  const handleOpenDialog = (user: UserWithUnitName | null = null) => {
      resetForm();
      if (user) {
          setEditingUser(user);
          setName(user.name);
          setEmail(user.email);
          setRole(user.role as UserRole);
          setUnitId(user.unitId || undefined);
      }
      setIsDialogOpen(true);
  }


  const handleAddOrUpdateUser = async () => {
    setIsSaving(true);
    let validationError = '';
    if (!name.trim()) validationError = 'Name is required.';
    else if (!email.trim()) validationError = 'Email is required.';
    else if (!editingUser && !password) validationError = 'Password is required for new users.';
    else if (role === 'UnitAdmin' && !unitId) validationError = 'A unit must be selected for Unit Admins.';
    
    if (validationError) {
        toast({ variant: 'destructive', title: 'Validation Error', description: validationError });
        setIsSaving(false);
        return;
    }
    
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    const method = editingUser ? 'PUT' : 'POST';

    const payload: any = { name, email, role };
    if (password) {
        payload.password = password; // Only include password if it's being set/changed
    }
    if (role === 'UnitAdmin') {
        payload.unitId = unitId;
    } else {
        payload.unitId = null;
    }

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to save user.');
        }

        toast({
            title: `User ${editingUser ? 'Updated' : 'Added'}`,
            description: `The user "${name}" has been saved.`
        });
        
        resetForm();
        setIsDialogOpen(false);
        router.refresh(); // This will trigger a re-fetch in the useEffect
        // Manually update state to see changes immediately
        const updatedUsersRes = await fetch('/api/users');
        const updatedUsersData = await updatedUsersRes.json();
        const unitsMap = new Map(units.map((u: Unit) => [u.id, u.name]));
         const enrichedUsers = updatedUsersData.users.map((user: User) => ({
            ...user,
            unitName: user.unitId ? unitsMap.get(user.unitId) : undefined
        }));
        setUsers(enrichedUsers);

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
        const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to delete user.');
        }
        toast({
            title: 'User Deleted',
            description: `The user "${userName}" has been deleted.`
        });
        setUsers(prev => prev.filter(u => u.id !== userId));

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };
  
  if (isLoading) {
    return (
        <div className="space-y-8 max-w-4xl">
             <div className="mb-6">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-80 mt-2" />
            </div>
             <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">Manage Users</h2>
            <p className="text-muted-foreground">Add, edit, or remove user accounts.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
            <UserPlus className="mr-2" />
            Add User
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                        {editingUser ? `Update the details for ${editingUser.name}.` : 'Fill in the details to create a new user.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Password</Label>
                        <div className="col-span-3 relative">
                            <Input id="password" type={showPassword ? 'text' : 'password'} placeholder={editingUser ? 'Leave blank to keep unchanged' : 'Required'} value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                                <SelectItem value="UnitAdmin">Unit Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {role === 'UnitAdmin' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="unit" className="text-right">Unit</Label>
                            <Select value={unitId} onValueChange={setUnitId}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map(unit => (
                                        <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleAddOrUpdateUser} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
      </Dialog>


      <Card>
        <CardHeader>
          <CardTitle>Existing Users</CardTitle>
          <CardDescription>List of all users with access to the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users || []).length > 0 ? (
                users!.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.unitName || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)} className="mr-2">
                            <Edit className="h-4 w-4" />
                        </Button>

                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={user.id === session?.user.id}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user account for <strong>{user.name}</strong>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id, user.name)}>
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
                  <TableCell colSpan={5} className="h-24 text-center">
                    No users found.
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
