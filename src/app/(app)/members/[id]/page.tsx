'use client';

import { ClientOnlyMemberForm } from "../components/client-only-member-form";
import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import type { Member } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

async function getMember(id: string): Promise<Member | null> {
    const res = await fetch(`/api/members/${id}`);
    if (!res.ok) {
        return null;
    }
    const data = await res.json();
    return data.member;
}

function EditMemberPageSkeleton() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-5 w-96 mt-2" />
      </div>
      <div className="space-y-8 p-8 border rounded-lg bg-card">
        <Skeleton className="h-10 w-1/3" />
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
         <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [member, setMember] = useState<Member | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMember() {
        try {
            const foundMember = await getMember(id);
            setMember(foundMember || undefined);
        } catch (error) {
            console.error("Failed to fetch member", error);
        } finally {
            setLoading(false);
        }
    }
    if (id) {
        loadMember();
    }
  }, [id]);

  if (loading) {
    return <EditMemberPageSkeleton />;
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
