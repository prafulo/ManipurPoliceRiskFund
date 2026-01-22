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
import { ArrowUpDown, Users, CreditCard, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import type { Activity, ActivityType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type SortKey = keyof Activity | '';
type SortDirection = 'asc' | 'desc';

interface ActivityTableProps {
  data: Activity[];
  isLoading: boolean;
}

const typeDisplay: Record<ActivityType, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    'new-member': { label: 'New Member', icon: Users, variant: 'secondary' },
    'payment': { label: 'Payment', icon: CreditCard, variant: 'default' },
    'transfer': { label: 'Transfer', icon: ArrowRightLeft, variant: 'secondary' }
};

export function ActivityTable({ data, isLoading }: ActivityTableProps) {
  const [filter, setFilter] = React.useState('');
  const [sortKey, setSortKey] = React.useState<SortKey>('date');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const rowsPerPage = 15;

  const filteredAndSortedData = React.useMemo(() => {
    const lowercasedFilter = filter.toLowerCase();
    let result = data.filter(activity =>
      activity.description.toLowerCase().includes(lowercasedFilter) ||
      activity.details.toLowerCase().includes(lowercasedFilter)
    );

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (sortKey === 'date') {
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
    { key: 'date', label: 'Date' },
    { key: 'type', label: 'Type' },
    { key: 'description', label: 'Description' },
    { key: 'details', label: 'Details' },
  ];

  if (isLoading) {
      return (
          <Card>
              <CardContent className="p-0">
                  <div className="p-4">
                      <Skeleton className="h-10 max-w-sm" />
                  </div>
                  <div className="border-t p-4 space-y-2">
                      {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
              </CardContent>
          </Card>
      );
  }


  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4">
          <Input
            placeholder="Filter activities..."
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="whitespace-nowrap">{format(new Date(activity.date), 'PP p')}</TableCell>
                    <TableCell>
                      <Badge variant={typeDisplay[activity.type].variant} className="gap-1.5">
                        <activity.type.icon className="h-3.5 w-3.5" />
                        {typeDisplay[activity.type].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{activity.description}</TableCell>
                    <TableCell>{activity.details}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={headers.length} className="h-24 text-center">
                    No activities found for the selected period.
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
