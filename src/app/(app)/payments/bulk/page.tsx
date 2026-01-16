'use client';

import { BulkPaymentForm } from "../components/bulk-payment-form";

export default function BulkPaymentPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Bulk Subscription Payment</h2>
        <p className="text-muted-foreground">Record payments for multiple members of a unit at once.</p>
      </div>
      <BulkPaymentForm />
    </div>
  );
}
