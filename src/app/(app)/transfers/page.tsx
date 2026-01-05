
'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { TransferTable } from "./components/transfer-table";
import type { Transfer, Unit } from "@/lib/types";
import { useEffect, useState } from "react";
import { transfers as initialTransfers } from "@/lib/data";

export default function TransfersPage() {
  const [transferData, setTransferData] = useState<Transfer[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load units
    const storedUnits = localStorage.getItem('units');
    setUnits(storedUnits ? JSON.parse(storedUnits) : []);

    // Load transfers
    const storedTransfers = localStorage.getItem('transfers');
    if (storedTransfers) {
      const parsedTransfers = JSON.parse(storedTransfers).map((t: any) => ({
        ...t,
        transferDate: new Date(t.transferDate),
      }));
      setTransferData(parsedTransfers);
    } else {
      localStorage.setItem('transfers', JSON.stringify(initialTransfers));
      setTransferData(initialTransfers);
    }
    setIsLoading(false);
  }, []);

  const enrichedTransfers = transferData.map(transfer => ({
      ...transfer,
      fromUnitName: units.find(u => u.id === transfer.fromUnitId)?.name || 'N/A',
      toUnitName: units.find(u => u.id === transfer.toUnitId)?.name || 'N/A',
  }));

  if (isLoading) {
    return <div>Loading transfers...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Transfers</h2>
          <p className="text-muted-foreground">Manage member unit transfers.</p>
        </div>
        <Link href="/transfers/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Transfer
          </Button>
        </Link>
      </div>
      <TransferTable data={enrichedTransfers} />
    </div>
  );
}
