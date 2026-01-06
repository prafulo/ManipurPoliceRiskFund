'use client';

import { TransferForm } from "../components/transfer-form";
import { Suspense } from "react";

export default function NewTransferPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">New Member Transfer</h2>
        <p className="text-muted-foreground">Record a member's transfer from one unit to another.</p>
      </div>
      <Suspense fallback={<div>Loading form...</div>}>
         <TransferForm />
      </Suspense>
    </div>
  );
}
