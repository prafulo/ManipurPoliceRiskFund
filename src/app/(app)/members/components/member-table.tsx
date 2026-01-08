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
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import type { Member } from '@/lib/types';
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

type EnrichedMember = Member & { unitName: string };
type SortKey = keyof EnrichedMember | '';
type SortDirection = 'asc' | 'desc';

interface MemberTableProps {
  data: EnrichedMember[];
  listType?: 'opened' | 'closed';
}

export function MemberTable({ data, listType = 'opened' }: MemberTableProps) {
  const { role, unit } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [filter, setFilter] = React.useState('');
  const [sortKey, setSortKey] = React.useState<SortKey>('name');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const rowsPerPage = 10;
  
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

  const roleFilteredData = React.useMemo(() => {
    if (role === 'Unit Admin' && unit) {
      return data.filter(member => member.unitName === unit);
    }
    return data;
  }, [data, role, unit]);

  const filteredAndSortedData = React.useMemo(() => {
    const lowercasedFilter = filter.toLowerCase();
    let result = roleFilteredData.filter(member =>
      (
        member.name.toLowerCase().includes(lowercasedFilter) ||
        (member.membershipCode && member.membershipCode.toLowerCase().includes(lowercasedFilter)) ||
        member.unitName.toLowerCase().includes(lowercasedFilter)
      )
    );

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey as keyof Member] as any;
        const valB = b[sortKey as keyof Member] as any;
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [roleFilteredData, filter, sortKey, sortDirection]);

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  const headers: { key: SortKey; label: string }[] = [
    { key: 'membershipCode', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'unitName', label: 'Unit' },
    { key: 'status', label: 'Status' },
  ];

  if (listType === 'closed') {
    headers.push({ key: 'closureReason', label: 'Reason for Closure' });
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4">
          <Input
            placeholder="Filter by code, name, or unit..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
        </div>
        <div className="border-t">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map(header => (
                  <TableHead key={header.key}>
                    <Button variant="ghost" onClick={() => handleSort(header.key as any)}>
                      {header.label}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                ))}
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.membershipCode}</TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.unitName}</TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'Opened' ? 'default' : 'destructive'} className={member.status === 'Opened' ? 'bg-green-600 hover:bg-green-700' : ''}>
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
                              <span className="sr-only">Open menu</span>
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
                                <DropdownMenuItem className="text-destructive focus:bg-destructive/20 focus:text-destructive">Delete Member</DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the profile for <strong>{member.name}</strong>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteMember(member.id)}>
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
                  <TableCell colSpan={headers.length + 1} className="h-24 text-center">
                    No members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between space-x-2 p-4 border-t">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
