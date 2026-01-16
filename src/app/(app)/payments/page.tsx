'use client';

import { Button } from "@/components/ui/button";
import { FileSpreadsheet, PlusCircle } from "lucide-react";
import Link from "next/link";
import { PaymentTable } from "./components/payment-table";
import type { Payment } from "@/lib/types";
import React from "react";
import { useToast } from "@/hooks/use-toast";

async function fetchData(): Promise<Payment[]> {
    const res = await fetch('/api/payments');
    const data = await res.json();
    // Prisma returns Decimal as a string in JSON, so we convert it to a number.
    return data.payments.map((p: any) => ({
      ...p,
      amount: Number(p.amount)
    }));
}

export default function PaymentsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [payments, setPayments] = React.useState<Payment[]>([]);

  React.useEffect(() => {
    async function loadData() {
        try {
            const data = await fetchData();
            setPayments(data);
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
    }
    loadData();
  }, [toast]);

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
        setPayments(prev => prev.filter(p => p.id !== paymentId));
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: "Error",
            description: error.message,
        });
    }
  };

  if (isLoading) {
    return <div>Loading payments...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Payments</h2>
          <p className="text-muted-foreground">Manage member subscription payments.</p>
        </div>
        <div className="flex gap-2">
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
      <PaymentTable data={payments || []} onDelete={handleDeletePayment} />
    </div>
  );
}
