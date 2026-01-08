
import { Sidebar } from '@/components/layout/sidebar';
import { AuthProvider } from '@/contexts/auth-context';
import { ClientOnlyHeader } from '@/components/layout/client-only-header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr]">
        <Sidebar />
        <div className="flex flex-col">
          <ClientOnlyHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
