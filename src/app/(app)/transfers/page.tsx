'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { TransferTable } from "./components/transfer-table";
import type { Transfer } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function TransfersPage() {
  const [transferData, setTransferData] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
        const res = await fetch(`/api/transfers?page=${page}&limit=10&query=${searchQuery}`);
        const data = await res.json();
        setTransferData(data.transfers || []);
        setTotalPages(data.pages || 1);
    } catch (error) {
        console.error("Failed to load transfer data", error);
    } finally {
        setIsLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  if (isLoading && transferData.length === 0) {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-10 w-36" />
            </div>
            <Card><CardContent className="p-8 space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
        </div>
    );
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
      <TransferTable 
        data={transferData} 
        isLoading={isLoading}
        pagination={{
            currentPage: page,
            totalPages: totalPages,
            onPageChange: setPage
        }}
        onSearch={handleSearch}
      />
    </div>
  );
}
