'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { PaymentTable } from "./components/payment-table";
import type { Payment } from "@/lib/types";
import React from "react";
import { payments as paymentData } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";

export default function PaymentsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [payments, setPayments] = React.useState<Payment[]>([]);

  React.useEffect(() => {
    setPayments(paymentData);
    setIsLoading(false);
  }, []);

  const handleDeletePayment = async (paymentId: string) => {
    toast({
      variant: "destructive",
      title: "Feature Disabled",
      description: "Data modification is disabled in local data mode.",
    });
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
      <PaymentTable data={payments || []} onDelete={handleDeletePayment} />
    </div>
  );
}
