'use client';

import { useState, useEffect, useCallback } from 'react';
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
  AlertDialogTrigger,
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
import type { User, Unit, UserRole } from '@/lib/types';
import { Trash2, Edit, UserPlus, Eye, EyeOff, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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

type UserWithUnitName = User & { unitName?: string };

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserWithUnitName[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();

  const [editingUser, setEditingUser] = useState<UserWithUnitName | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('UnitAdmin');
  const [unitId, setUnitId] = useState<string | undefined>(undefined);

  const loadData = useCallback(async () => {
    if (!session) return;
    setIsDataLoading(true);
    try {
        const [usersRes, unitsRes] = await Promise.all([
            fetch(`/api/users?page=${page}&limit=10&query=${searchQuery}`),
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
        setTotalPages(usersData.pages || 1);
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch data.'})
    } finally {
        setIsLoading(false);
        setIsDataLoading(false);
    }
  }, [page, searchQuery, session, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
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
    if (password) payload.password = password;
    payload.unitId = role === 'UnitAdmin' ? unitId : null;

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

        toast({ title: `User ${editingUser ? 'Updated' : 'Added'}`, description: `User "${name}" saved successfully.` });
        resetForm();
        setIsDialogOpen(false);
        loadData();
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
        toast({ title: 'User Deleted', description: `User "${userName}" deleted.` });
        loadData();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };
  
  if (isLoading) {
    return (
        <div className="space-y-8 max-w-4xl">
             <div className="mb-6"><Skeleton className="h-9 w-64" /><Skeleton className="h-5 w-80 mt-2" /></div>
             <Card><CardHeader><Skeleton className="h-7 w-48" /></CardHeader><CardContent><div className="space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div></CardContent></Card>
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
        <Button onClick={() => handleOpenDialog()}><UserPlus className="mr-2" /> Add User</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>{editingUser ? `Update details for ${editingUser.name}.` : 'Create a new user account.'}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" /></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="email" className="text-right">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" /></div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Password</Label>
                        <div className="col-span-3 relative">
                            <Input id="password" type={showPassword ? 'text' : 'password'} placeholder={editingUser ? 'Keep blank to stay same' : 'Required'} value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <Select value={role} onValueChange={(v) => setRole(v as UserRole)}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SuperAdmin">Super Admin</SelectItem><SelectItem value="UnitAdmin">Unit Admin</SelectItem></SelectContent></Select>
                    </div>
                    {role === 'UnitAdmin' && (
                        <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="unit" className="text-right">Unit</Label><Select value={unitId} onValueChange={setUnitId}><SelectTrigger className="col-span-3"><SelectValue placeholder="Select unit" /></SelectTrigger><SelectContent>{units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent></Select></div>
                    )}
                </div>
                <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleAddOrUpdateUser} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button></DialogFooter>
            </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle>Existing Users</CardTitle><CardDescription>Manage application access.</CardDescription></div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }} className="w-48 h-8" />
            {isDataLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Unit</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {users.length > 0 ? users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-xs">{user.email}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{user.role}</Badge></TableCell>
                  <TableCell>{user.unitName || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)} className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={user.id === session?.user.id}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete User?</AlertDialogTitle><AlertDialogDescription>Permanently remove <strong>{user.name}</strong>?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(user.id, user.name)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={5} className="h-24 text-center">No users found.</TableCell></TableRow>}
            </TableBody>
          </Table>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(page - 1)} disabled={page <= 1 || isDataLoading}><ChevronLeft className="h-4 w-4" /></Button>
              {getPageNumbers().map(p => <Button key={p} variant={page === p ? "default" : "outline"} size="icon" className="h-7 w-7 text-[10px]" onClick={() => setPage(p)} disabled={isDataLoading}>{p}</Button>)}
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(page + 1)} disabled={page >= totalPages || isDataLoading}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
