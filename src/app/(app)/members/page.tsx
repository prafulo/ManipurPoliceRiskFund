'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { MemberTable } from "./components/member-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Member, Unit } from '@/lib/types';
import { isPast } from 'date-fns';
import { useCollection, useFirestore } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';

export default function MembersPage() {
  const firestore = useFirestore();
  
  const { data: membersData, loading: membersLoading, error: membersError } = useCollection<Member>(
    firestore ? collection(firestore, 'members') : null
  );

  const { data: unitsData, loading: unitsLoading } = useCollection<Unit>(
    firestore ? collection(firestore, 'units') : null
  );

  React.useEffect(() => {
    async function autoCloseSuperannuated() {
      if (!firestore || !membersData || membersData.length === 0) return;

      const batch = writeBatch(firestore);
      const today = new Date();
      let wasUpdated = false;

      membersData.forEach(member => {
        if (member.status === 'Opened' && member.superannuationDate && isPast(member.superannuationDate.toDate())) {
          const memberRef = doc(firestore, 'members', member.id);
          batch.update(memberRef, {
            status: 'Closed',
            closureReason: 'Retirement',
            dateOfDischarge: member.superannuationDate,
          });
          wasUpdated = true;
        }
      });

      if (wasUpdated) {
        try {
          await batch.commit();
          console.log("Automatically closed superannuated members.");
          // Data will be re-fetched automatically by useCollection hook
        } catch (error) {
          console.error("Error auto-closing members:", error);
        }
      }
    }

    autoCloseSuperannuated();
  }, [firestore, membersData]);

  const isLoading = membersLoading || unitsLoading;

  if (isLoading) {
    return <div>Loading members...</div>;
  }

  if (membersError) {
    return <div>Error loading members: {membersError.message}</div>;
  }

  const members = membersData || [];
  const units = unitsData || [];

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
          <MemberTable data={openMembers} listType="opened" />
        </TabsContent>
        <TabsContent value="closed" className="mt-4">
          <MemberTable data={closedMembers} listType="closed" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
