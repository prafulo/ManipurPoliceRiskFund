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
import { MoreHorizontal, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"

interface PaymentTableProps {
  data: Payment[];
  onDelete: (paymentId: string) => void;
  isLoading?: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onSearch: (query: string) => void;
}

export function PaymentTable({ data, onDelete, isLoading, pagination, onSearch }: PaymentTableProps) {
  const router = useRouter();
  const [localSearch, setLocalSearch] = React.useState('');
  const [paymentToDelete, setPaymentToDelete] = React.useState<string | null>(null);
  const pageSize = 10;

  const formatMonths = (months: any) => {
    let monthArray: any[];
    if(typeof months === 'string') {
        try { monthArray = JSON.parse(months); } catch { return 'Invalid data'; }
    } else { monthArray = months; }
    return monthArray.map((m: any) => format(new Date(m), 'MMM yy')).join(', ');
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(pagination.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <form onSubmit={handleSearchSubmit} className="p-4 flex gap-2 print:hidden">
            <Input
              placeholder="Search by name, code or EIN..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit" variant="secondary">Search</Button>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin self-center ml-2" />}
          </form>
          <div className="border-t overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Sl. No.</TableHead>
                  <TableHead>Member Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Months Paid</TableHead>
                  <TableHead className="text-right w-[80px] print:hidden">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((payment, index) => (
                    <TableRow key={payment.id} className={isLoading ? 'opacity-50' : ''}>
                      <TableCell className="text-muted-foreground text-xs">
                          {((pagination.currentPage - 1) * pageSize) + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{payment.memberName}</TableCell>
                      <TableCell className="font-mono text-xs">{payment.membershipCode}</TableCell>
                      <TableCell>{payment.unitName}</TableCell>
                      <TableCell>{format(new Date(payment.paymentDate), 'PP')}</TableCell>
                      <TableCell>{Number(payment.amount).toFixed(2)}</TableCell>
                      <TableCell className="text-[10px] uppercase text-muted-foreground">{formatMonths(payment.months)}</TableCell>
                      <TableCell className="text-right print:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => router.push(`/payments/${payment.id}/receipt`)}>
                              View Receipt
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onSelect={() => setPaymentToDelete(payment.id)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {isLoading ? 'Loading...' : 'No payments found.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing Page <span className="font-medium text-foreground">{pagination.currentPage}</span> of <span className="font-medium text-foreground">{pagination.totalPages}</span>
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {getPageNumbers().map(pageNum => (
                <Button
                  key={pageNum}
                  variant={pagination.currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8 text-xs"
                  onClick={() => pagination.onPageChange(pageNum)}
                  disabled={isLoading}
                >
                  {pageNum}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!paymentToDelete} onOpenChange={(open) => !open && setPaymentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete payment record?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (paymentToDelete) {
                onDelete(paymentToDelete);
                setPaymentToDelete(null);
              }
            }}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
