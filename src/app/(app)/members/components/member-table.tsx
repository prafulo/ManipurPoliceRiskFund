'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Member, UserRole } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';

type EnrichedMember = Member & { unitName: string };

interface MemberTableProps {
  data: EnrichedMember[];
  listType?: 'opened' | 'closed';
  isLoading?: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onSearch: (query: string) => void;
}

export function MemberTable({ data, listType = 'opened', isLoading, pagination, onSearch }: MemberTableProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [localSearch, setLocalSearch] = React.useState('');

  const handleDeleteMember = async (memberId: string) => {
    try {
        const res = await fetch(`/api/members/${memberId}`, { method: 'DELETE' });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to delete member.');
        }
        toast({
            title: "Member Deleted",
            description: "The member profile has been permanently deleted.",
        });
        router.refresh();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: "Error",
            description: error.message,
        });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  };
  
  const headers = [
    { key: 'membershipCode', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'unitName', label: 'Unit' },
    { key: 'status', label: 'Status' },
  ];

  if (listType === 'closed') {
    headers.push({ key: 'closureReason', label: 'Reason' });
  }

  return (
    <Card>
      <CardContent className="p-0">
        <form onSubmit={handleSearchSubmit} className="p-4 flex gap-2">
          <Input
            placeholder="Filter by code, name..."
            value={localSearch}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary">Search</Button>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin self-center ml-2" />}
        </form>
        <div className="border-t">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map(header => (
                  <TableHead key={header.key}>
                    {header.label}
                  </TableHead>
                ))}
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((member) => (
                  <TableRow key={member.id} className={isLoading ? 'opacity-50' : ''}>
                    <TableCell>{member.membershipCode}</TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.unitName}</TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'Opened' ? 'default' : 'destructive'} className={member.status === 'Opened' ? 'bg-green-600' : ''}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    {listType === 'closed' && (
                        <TableCell>{member.closureReason}</TableCell>
                    )}
                    <TableCell className="text-right">
                       <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/members/${member.id}`)}>
                              View/Edit Profile
                            </DropdownMenuItem>
                            {member.status === 'Opened' && (
                              <>
                                <DropdownMenuItem onClick={() => router.push(`/payments/new?memberId=${member.id}`)}>Add Payment</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/transfers/new?memberId=${member.id}`)}>Transfer Unit</DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                             <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive">Delete Member</DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Member Profile?</AlertDialogTitle>
                              <AlertDialogDescription>Permanently delete <strong>{member.name}</strong>?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteMember(member.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={headers.length + 1} className="h-24 text-center">
                    {isLoading ? 'Loading...' : 'No members found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between space-x-2 p-4 border-t">
          <span className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
