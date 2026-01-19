'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { ReleaseTable } from "./components/release-table";
import type { Member, Unit } from "@/lib/types";
import React from "react";
import { useToast } from "@/hooks/use-toast";

async function fetchData(): Promise<Member[]> {
    const res = await fetch('/api/subscription-releases');
    if (!res.ok) {
        throw new Error('Failed to fetch release data');
    }
    const data = await res.json();
    // Prisma returns Decimal as a string in JSON, so we convert it to a number.
    return data.releases.map((r: any) => ({
      ...r,
      releaseAmount: r.releaseAmount ? Number(r.releaseAmount) : null
    }));
}

export default function SubscriptionReleasesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [releases, setReleases] = React.useState<Member[]>([]);

  React.useEffect(() => {
    async function loadData() {
        try {
            const data = await fetchData();
            setReleases(data);
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
    }
    loadData();
  }, [toast]);

  if (isLoading) {
    return <div>Loading release records...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Subscription Releases</h2>
          <p className="text-muted-foreground">Manage and review member subscription payouts.</p>
        </div>
        <div className="flex gap-2">
            <Link href="/subscription-release/new">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Release
            </Button>
            </Link>
        </div>
      </div>
      <ReleaseTable data={releases || []} />
    </div>
  );
}
