import { MemberForm } from "../components/member-form";

export default function NewMemberPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Create New Member Profile</h2>
        <p className="text-muted-foreground">Fill out the form to add a new member to the system.</p>
      </div>
      <MemberForm />
    </div>
  );
}
