'use client';

import { ClientOnlyMemberForm } from "../components/client-only-member-form";
import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import type { Member } from "@/lib/types";
import { members } from "@/lib/data";


export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [member, setMember] = useState<Member | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundMember = members.find(m => m.id === id);
    setMember(foundMember);
    setLoading(false);
  }, [id]);

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
