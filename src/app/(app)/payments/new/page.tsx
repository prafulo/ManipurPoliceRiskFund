'use client';

import { PaymentForm } from "../components/payment-form";
import { Suspense } from "react";

export default function NewPaymentPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">New Subscription Payment</h2>
        <p className="text-muted-foreground">Record a new payment for a member.</p>
      </div>
      <Suspense fallback={<div>Loading form...</div>}>
         <PaymentForm />
      </Suspense>
    </div>
  );
}
