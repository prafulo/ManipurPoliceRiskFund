
'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { payments as initialPayments } from "@/lib/data";
import { PaymentTable } from "./components/payment-table";
import type { Payment } from "@/lib/types";
import { useEffect, useState } from "react";

export default function PaymentsPage() {
  const [paymentData, setPaymentData] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Client-side only
    const storedPayments = localStorage.getItem('payments');
    if (storedPayments) {
      // Parse dates correctly from string
      const parsedPayments = JSON.parse(storedPayments).map((p: any) => ({
        ...p,
        paymentDate: new Date(p.paymentDate),
        months: p.months.map((m: string) => new Date(m)),
      }));
      setPaymentData(parsedPayments);
    } else {
      localStorage.setItem('payments', JSON.stringify(initialPayments));
      setPaymentData(initialPayments);
    }
    setIsLoading(false);
  }, []);

  const handleDeletePayment = (paymentId: string) => {
    const updatedPayments = paymentData.filter(p => p.id !== paymentId);
    setPaymentData(updatedPayments);
    localStorage.setItem('payments', JSON.stringify(updatedPayments));
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
        <Link href="/payments/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Payment
          </Button>
        </Link>
      </div>
      <PaymentTable data={paymentData} onDelete={handleDeletePayment} />
    </div>
  );
}
