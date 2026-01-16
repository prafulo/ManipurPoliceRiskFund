import { redirect } from 'next/navigation';

export default function SettingsPage() {
  // Redirect to the first available settings sub-page
  redirect('/settings/units');
}
