'use client';
import { ReleaseForm } from '../components/release-form';

export default function NewReleasePage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">New Subscription Release</h2>
        <p className="text-muted-foreground">Process the subscription payout for a retired member.</p>
      </div>
      <ReleaseForm />
    </div>
  );
}
