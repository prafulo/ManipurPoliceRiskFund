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
import { Users, CreditCard, ArrowRightLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import type { Activity, ActivityType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityTableProps {
  data: Activity[];
  isLoading: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

const typeDisplay: Record<ActivityType, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    'new-member': { label: 'New Member', icon: Users, variant: 'secondary' },
    'payment': { label: 'Payment', icon: CreditCard, variant: 'default' },
    'transfer': { label: 'Transfer', icon: ArrowRightLeft, variant: 'secondary' }
};

export function ActivityTable({ data, isLoading, pagination }: ActivityTableProps) {
  const pageSize = 15;

  if (isLoading && data.length === 0) {
      return (
          <Card>
              <CardContent className="p-8 space-y-4">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </CardContent>
          </Card>
      );
  }

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
        <div className="border-t overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((activity, index) => {
                  const config = typeDisplay[activity.type];
                  const Icon = config.icon;
                  return (
                    <TableRow key={activity.id} className={isLoading ? 'opacity-50' : ''}>
                      <TableCell className="text-muted-foreground text-xs">
                        {((pagination.currentPage - 1) * pageSize) + index + 1}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{format(new Date(activity.date), 'PP p')}</TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="gap-1.5">
                          <Icon className="h-3.5 w-3.5" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{activity.description}</TableCell>
                      <TableCell>{activity.details}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No activities found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t print:hidden">
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