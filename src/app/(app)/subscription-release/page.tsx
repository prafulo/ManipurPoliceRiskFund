'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { ReleaseTable } from "./components/release-table";
import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function SubscriptionReleasesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [releases, setReleases] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
        const res = await fetch(`/api/subscription-releases?page=${page}&limit=10&query=${searchQuery}`);
        const data = await res.json();
        setReleases(data.releases || []);
        setTotalPages(data.pages || 1);
    } catch (error) {
        console.error("Failed to fetch releases", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not fetch subscription release data.'
        });
    } finally {
        setIsLoading(false);
    }
  }, [page, searchQuery, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  if (isLoading && releases.length === 0) {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <Card><CardContent className="p-8 space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
        </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Subscription Releases</h2>
          <p className="text-muted-foreground">Manage member subscription payouts.</p>
        </div>
        <Link href="/subscription-release/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Release
          </Button>
        </Link>
      </div>
      <ReleaseTable 
        data={releases || []} 
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
