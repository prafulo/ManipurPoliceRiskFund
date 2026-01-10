'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { TransferTable } from "./components/transfer-table";
import type { Transfer, units as Unit } from "@/lib/types";
import { useEffect, useState } from "react";

async function fetchData() {
    const [transfersRes, unitsRes] = await Promise.all([
        fetch('/api/transfers'),
        fetch('/api/units')
    ]);
    const [transfersData, unitsData] = await Promise.all([
        transfersRes.json(),
        unitsRes.json()
    ]);
    return { transfers: transfersData.transfers, units: unitsData.units };
}

export default function TransfersPage() {
  const [transferData, setTransferData] = useState<Transfer[]>([]);
  const [unitData, setUnitData] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        try {
            const { transfers, units } = await fetchData();
            setTransferData(transfers);
            setUnitData(units);
        } catch (error) {
            console.error("Failed to load transfer data", error);
        } finally {
            setIsLoading(false);
        }
    }
    loadData();
  }, []);

  const enrichedTransfers = (transferData || []).map(transfer => ({
      ...transfer,
      fromUnitName: unitData?.find(u => u.id === transfer.fromUnitId)?.name || 'N/A',
      toUnitName: unitData?.find(u => u.id === transfer.toUnitId)?.name || 'N/A',
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
