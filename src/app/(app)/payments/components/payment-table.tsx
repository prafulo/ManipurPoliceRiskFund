
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
import type { Payment } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
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


type SortKey = keyof Payment | '';
type SortDirection = 'asc' | 'desc';

interface PaymentTableProps {
  data: Payment[];
  onDelete: (paymentId: string) => void;
}

export function PaymentTable({ data, onDelete }: PaymentTableProps) {
  const router = useRouter();

  const [filter, setFilter] = React.useState('');
  const [sortKey, setSortKey] = React.useState<SortKey>('paymentDate');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const rowsPerPage = 10;

  const filteredAndSortedData = React.useMemo(() => {
    let result = data.filter(payment =>
      payment.memberName.toLowerCase().includes(filter.toLowerCase())
    );

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA instanceof Date && valB instanceof Date) {
            return sortDirection === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filter, sortKey, sortDirection]);

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
    { key: 'memberName', label: 'Member Name' },
    { key: 'membershipCode', label: 'Code' },
    { key: 'unitName', label: 'Unit' },
    { key: 'paymentDate', label: 'Payment Date' },
    { key: 'amount', label: 'Amount' },
  ];

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4">
          <Input
            placeholder="Filter by name..."
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
                    <Button variant="ghost" onClick={() => handleSort(header.key)}>
                      {header.label}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                ))}
                 <TableHead>Months Paid</TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.memberName}</TableCell>
                    <TableCell>{payment.membershipCode}</TableCell>
                    <TableCell>{payment.unitName}</TableCell>
                    <TableCell>{format(new Date(payment.paymentDate), 'PP')}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.months.map(m => format(new Date(m), 'MMM yyyy')).join(', ')}</TableCell>
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
                            <DropdownMenuItem>View Receipt</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive focus:bg-destructive/20 focus:text-destructive">
                                    Delete Payment
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this payment record.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(payment.id)}>
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
                  <TableCell colSpan={headers.length + 2} className="h-24 text-center">
                    No payments found.
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

