import { PaymentForm } from "../components/payment-form";
import { members, units } from "@/lib/data";
import { Suspense } from "react";

function PaymentFormLoader() {
    // You can add a skeleton loader here if needed
    return <PaymentForm members={members} units={units} />
}

export default function NewPaymentPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">New Subscription Payment</h2>
        <p className="text-muted-foreground">Record a new payment for a member.</p>
      </div>
      <Suspense fallback={<div>Loading form...</div>}>
         <PaymentFormLoader />
      </Suspense>
    </div>
  );
}
