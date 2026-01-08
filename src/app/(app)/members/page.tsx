'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { MemberTable } from "./components/member-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Member, Unit } from '@/lib/types';


async function fetchData() {
    const [membersRes, unitsRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/units')
    ]);
    const [membersData, unitsData] = await Promise.all([
        membersRes.json(),
        unitsRes.json()
    ]);
    return { members: membersData.members, units: unitsData.units };
}


export default function MembersPage() {
  const [enrichedMembers, setEnrichedMembers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
        try {
            const { members, units } = await fetchData();
            const unitsMap = new Map(units.map((unit: Unit) => [unit.id, unit.name]));
            const allMembers = members.map((member: Member) => ({
                ...member,
                unitName: unitsMap.get(member.unitId) || 'N/A',
            }));
            setEnrichedMembers(allMembers);
        } catch (error) {
            console.error("Failed to fetch members data", error);
        } finally {
            setIsLoading(false);
        }
    }
    loadData();
  }, []);


  if (isLoading) {
    return <div>Loading members...</div>;
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
