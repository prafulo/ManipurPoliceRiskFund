'use client';

import { TransferForm } from "../components/transfer-form";
import { Suspense, useEffect, useState } from "react";
import type { Member, Unit } from "@/lib/types";

function TransferFormLoader() {
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
        }

        setLoading(false);
    }, []);

    if (loading) {
        return <div>Loading form...</div>
    }

    return <TransferForm members={members} units={units} />
}

export default function NewTransferPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">New Member Transfer</h2>
        <p className="text-muted-foreground">Record a member's transfer from one unit to another.</p>
      </div>
      <Suspense fallback={<div>Loading form...</div>}>
         <TransferFormLoader />
      </Suspense>
    </div>
  );
}
