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
import { ArrowUpDown } from 'lucide-react';
import type { SubscriptionRelease } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

type SortKey = keyof SubscriptionRelease | '';
type SortDirection = 'asc' | 'desc';

interface ReleaseTableProps {
  data: SubscriptionRelease[];
}

export function ReleaseTable({ data }: ReleaseTableProps) {
  const [filter, setFilter] = React.useState('');
  const [sortKey, setSortKey] = React.useState<SortKey>('releaseDate');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const rowsPerPage = 10;

  const filteredAndSortedData = React.useMemo(() => {
    let result = data.filter(release =>
      release.memberName?.toLowerCase().includes(filter.toLowerCase())
    );

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (sortKey === 'releaseDate' || sortKey === 'createdAt') {
            const dateA = new Date(valA as string).getTime();
            const dateB = new Date(valB as string).getTime();
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
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
    { key: 'releaseDate', label: 'Release Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'notes', label: 'Notes' },
  ];

  const toDate = (dateStr: string | Date): Date => {
    return new Date(dateStr);
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4">
          <Input
            placeholder="Filter by member name..."
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((release) => (
                  <TableRow key={release.id}>
                    <TableCell className="font-medium">{release.memberName}</TableCell>
                    <TableCell>{release.membershipCode}</TableCell>
                    <TableCell>{release.unitName}</TableCell>
                    <TableCell>{format(toDate(release.releaseDate), 'PP')}</TableCell>
                    <TableCell>₹{release.amount.toFixed(2)}</TableCell>
                    <TableCell className="max-w-xs truncate">{release.notes}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={headers.length} className="h-24 text-center">
                    No release records found.
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
