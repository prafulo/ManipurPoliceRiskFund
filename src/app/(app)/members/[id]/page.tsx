'use client';

import { ClientOnlyMemberForm } from "../components/client-only-member-form";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import type { Member } from "@/lib/types";

export default function EditMemberPage({ params }: { params: { id: string } }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allMembersString = localStorage.getItem('members');
    if (allMembersString) {
      const allMembers = JSON.parse(allMembersString);
      const foundMember = allMembers.find((m: Member) => m.id === params.id);
      if (foundMember) {
        setMember(foundMember);
      }
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return <div>Loading member data...</div>;
  }

  if (!member) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Edit Member Profile</h2>
        <p className="text-muted-foreground">Update details for <span className="font-semibold">{member.name}</span>.</p>
      </div>
      <ClientOnlyMemberForm member={member} />
    </div>
  );
}
