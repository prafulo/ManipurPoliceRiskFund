'use client';

import { ClientOnlyMemberForm } from "../components/client-only-member-form";
import { notFound } from "next/navigation";
import { use, useMemo } from "react";
import type { Member } from "@/lib/types";
import { useDoc, useFirestore } from "@/firebase/hooks";
import { doc } from "firebase/firestore";

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();

  const memberRef = useMemo(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'members', id);
  }, [firestore, id]);

  const { data: member, loading } = useDoc<Member>(memberRef);

  if (loading) {
    return <div>Loading member data...</div>;
  }

  if (!member && !loading) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Edit Member Profile</h2>
        <p className="text-muted-foreground">Update details for <span className="font-semibold">{member?.name}</span>.</p>
      </div>
      <ClientOnlyMemberForm member={member} />
    </div>
  );
}
