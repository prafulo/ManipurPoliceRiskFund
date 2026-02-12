
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, PlusCircle } from "lucide-react";
import Link from "next/link";
import { PaymentTable } from "./components/payment-table";
import type { Payment } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ImportPaymentsDialog } from "./components/import-payments-dialog";

export default function PaymentsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
        const res = await fetch(`/api/payments?page=${page}&limit=10&query=${searchQuery}`);
        const data = await res.json();
        setPayments(data.payments || []);
        setTotalPages(data.pages || 1);
    } catch (error) {
        console.error("Failed to fetch payments", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not fetch payment data.'
        });
    } finally {
        setIsLoading(false);
    }
  }, [page, searchQuery, toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeletePayment = async (paymentId: string) => {
    try {
        const res = await fetch(`/api/payments/${paymentId}`, { method: 'DELETE' });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to delete payment.');
        }
        toast({
            title: "Payment Deleted",
            description: "The payment record has been deleted.",
        });
        loadData();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: "Error",
            description: error.message,
        });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  if (isLoading && payments.length === 0) {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-9 w-48" />
                <div className="flex gap-2"><Skeleton className="h-10 w-32" /><Skeleton className="h-10 w-32" /></div>
            </div>
            <Card><CardContent className="p-8"><Skeleton className="h-12 w-full mb-4" /><Skeleton className="h-12 w-full" /></CardContent></Card>
        </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Payments</h2>
          <p className="text-muted-foreground">Manage member subscription payments.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <ImportPaymentsDialog />
            <Link href="/payments/bulk">
              <Button variant="outline">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Bulk Payment
              </Button>
            </Link>
            <Link href="/payments/new">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Payment
            </Button>
            </Link>
        </div>
      </div>
      <PaymentTable 
        data={payments} 
        onDelete={handleDeletePayment} 
        isLoading={isLoading}
        pagination={{
            currentPage: page,
            totalPages: totalPages,
            onPageChange: setPage
        }}
        onSearch={handleSearch}
      />
    </div>
  );
}
