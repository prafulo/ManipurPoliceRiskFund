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
import { Users, CreditCard, ArrowRightLeft, Loader2 } from 'lucide-react';
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
  if (isLoading && data.length === 0) {
      return (
          <Card>
              <CardContent className="p-8 space-y-4">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </CardContent>
          </Card>
      );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-t">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((activity) => {
                  const config = typeDisplay[activity.type];
                  const Icon = config.icon;
                  return (
                    <TableRow key={activity.id} className={isLoading ? 'opacity-50' : ''}>
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
                  <TableCell colSpan={4} className="h-24 text-center">
                    No activities found.
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
