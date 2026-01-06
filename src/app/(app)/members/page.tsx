'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { MemberTable } from "./components/member-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Member, Unit } from '@/lib/types';
import { isPast } from 'date-fns';

export default function MembersPage() {
  const [enrichedMembers, setEnrichedMembers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch('/api/members');
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }
        const data = await response.json();
        
        // TODO: Auto-closing superannuated members needs to be re-implemented via an API endpoint
        setEnrichedMembers(data.members || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMembers();
  }, []);


  if (isLoading) {
    return <div>Loading members...</div>;
  }

  if (error) {
    return <div>Error loading members: {error.message}</div>;
  }

  const openMembers = enrichedMembers.filter(m => m.status === 'Opened');
  const closedMembers = enrichedMembers.filter(m => m.status === 'Closed');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Members</h2>
          <p className="text-muted-foreground">Manage your organization's members.</p>
        </div>
        <Link href="/members/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="opened">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="opened">Opened</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
        <TabsContent value="opened" className="mt-4">
          <MemberTable data={openMembers} listType="opened" />
        </TabsContent>
        <TabsContent value="closed" className="mt-4">
          <MemberTable data={closedMembers} listType="closed" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
