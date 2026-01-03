
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { MemberTable } from "./components/member-table";
import { members as initialMembers, units as defaultUnits } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Member, Unit } from '@/lib/types';

export default function MembersPage() {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [units, setUnits] = React.useState<Unit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Load members
    const storedMembers = localStorage.getItem('members');
    let memberData;
    if (storedMembers) {
      memberData = JSON.parse(storedMembers).map((m: any) => ({
        ...m,
        dateOfBirth: new Date(m.dateOfBirth),
        dateOfEnrollment: new Date(m.dateOfEnrollment),
        superannuationDate: new Date(m.superannuationDate),
        subscriptionStartDate: new Date(m.subscriptionStartDate),
        dateApplied: new Date(m.dateApplied),
        receiptDate: new Date(m.receiptDate),
        allotmentDate: new Date(m.allotmentDate),
        dateOfDischarge: m.dateOfDischarge ? new Date(m.dateOfDischarge) : undefined,
      }));
    } else {
      memberData = initialMembers;
      localStorage.setItem('members', JSON.stringify(initialMembers));
    }
    setMembers(memberData);

    // Load units
    const storedUnits = localStorage.getItem('units');
    if (storedUnits) {
      setUnits(JSON.parse(storedUnits));
    } else {
      localStorage.setItem('units', JSON.stringify(defaultUnits));
      setUnits(defaultUnits);
    }

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading members...</div>
  }

  const enrichedMembers = members.map(member => ({
    ...member,
    unitName: units.find(u => u.id === member.unitId)?.name || 'N/A'
  }));

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
          <MemberTable data={openMembers} />
        </TabsContent>
        <TabsContent value="closed" className="mt-4">
          <MemberTable data={closedMembers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
