import { ClientOnlyMemberForm } from "../components/client-only-member-form";
import { members } from "@/lib/data";
import { notFound } from "next/navigation";

export default function EditMemberPage({ params }: { params: { id: string } }) {
  const member = members.find(m => m.id === params.id);

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
