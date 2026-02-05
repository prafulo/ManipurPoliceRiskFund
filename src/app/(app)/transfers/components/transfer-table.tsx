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
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Transfer } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

type EnrichedTransfer = Transfer & { fromUnitName: string, toUnitName: string, membershipCode: string };

interface TransferTableProps {
  data: EnrichedTransfer[];
  isLoading?: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onSearch: (query: string) => void;
}

export function TransferTable({ data, isLoading, pagination, onSearch }: TransferTableProps) {
  const [localSearch, setLocalSearch] = React.useState('');

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
    <Card>
      <CardContent className="p-0">
        <form onSubmit={handleSearchSubmit} className="p-4 flex gap-2">
          <Input
            placeholder="Search by name or code..."
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
                <TableHead>Member Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>From Unit</TableHead>
                <TableHead>To Unit</TableHead>
                <TableHead>Transfer Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((transfer) => (
                  <TableRow key={transfer.id} className={isLoading ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{transfer.memberName}</TableCell>
                    <TableCell className="font-mono text-xs">{transfer.membershipCode}</TableCell>
                    <TableCell>{transfer.fromUnitName}</TableCell>
                    <TableCell>{transfer.toUnitName}</TableCell>
                    <TableCell>{format(new Date(transfer.transferDate), 'PP')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {isLoading ? 'Loading...' : 'No transfers found.'}
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
  );
}
