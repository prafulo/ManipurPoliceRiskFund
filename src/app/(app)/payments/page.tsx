'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { PaymentTable } from "./components/payment-table";
import type { Payment } from "@/lib/types";
import React from "react";
import { useCollection, useFirestore } from '@/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

export default function PaymentsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const { data: paymentData, loading: isLoading, error } = useCollection<Payment>(
    firestore ? collection(firestore, 'payments') : null
  );

  const handleDeletePayment = async (paymentId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "payments", paymentId));
      toast({
        title: "Payment Deleted",
        description: "The payment record has been successfully deleted.",
      });
    } catch (e) {
      console.error("Error deleting payment: ", e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the payment record.",
      });
    }
  };

  if (isLoading) {
    return <div>Loading payments...</div>;
  }
  
  if (error) {
    return <div>Error: {error.message}</div>;
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
      <PaymentTable data={paymentData || []} onDelete={handleDeletePayment} />
    </div>
  );
}
