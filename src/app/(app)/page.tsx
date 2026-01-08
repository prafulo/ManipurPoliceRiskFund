// This file is no longer needed as the root page.tsx handles redirection.
// You can optionally delete it.
import { redirect } from 'next/navigation';

export default function AppPage() {
  redirect('/dashboard');
}
