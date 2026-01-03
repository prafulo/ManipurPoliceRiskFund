'use client';

import { PaymentForm } from "../components/payment-form";
import { units as defaultUnits } from "@/lib/data";
import { Suspense, useEffect, useState } from "react";
import type { Member, Unit } from "@/lib/types";

function PaymentFormLoader() {
    const [members, setMembers] = useState<Member[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedMembers = localStorage.getItem('members');
        if (storedMembers) {
            setMembers(JSON.parse(storedMembers));
        }

        const storedUnits = localStorage.getItem('units');
        if (storedUnits) {
            setUnits(JSON.parse(storedUnits));
        } else {
            setUnits(defaultUnits);
        }

        setLoading(false);
    }, []);

    if (loading) {
        return <div>Loading form...</div>
    }

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
