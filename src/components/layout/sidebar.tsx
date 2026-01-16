'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Settings, FileText, CreditCard, ArrowRightLeft, Users2, ChevronRight, Building, DollarSign, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '../logo';
import { useSession } from 'next-auth/react';
import type { UserRole } from '@/lib/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/transfers', label: 'Transfers', icon: ArrowRightLeft },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/users', label: 'Users', icon: Users2, adminOnly: true },
];

const settingsNavItems = [
    { href: '/settings/units', label: 'Units', icon: Building },
    { href: '/settings/financial', label: 'Financial', icon: DollarSign },
    { href: '/settings/database', label: 'Database', icon: Database, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user.role as UserRole;
  
  const isSettingsOpen = pathname.startsWith('/settings');

  return (
    <aside className="hidden md:flex w-64 flex-col bg-card border-r">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <div className="text-xl font-bold font-headline text-primary leading-tight">
            <div>Manipur Police</div>
            <div>Risk Fund</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && role !== 'SuperAdmin') {
            return null;
          }
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:bg-primary/10',
                isActive ? 'bg-primary/20 text-primary font-semibold' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <Collapsible defaultOpen={isSettingsOpen} className="space-y-1">
            <CollapsibleTrigger className={cn("flex items-center justify-between w-full gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:bg-primary/10", isSettingsOpen ? 'text-primary font-semibold' : 'text-muted-foreground', )}>
                <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                </div>
                <ChevronRight className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-7 space-y-1">
                 {settingsNavItems.map((item) => {
                    if (item.adminOnly && role !== 'SuperAdmin') {
                        return null;
                    }
                    const isActive = pathname === item.href;
                    return (
                        <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:bg-primary/10 text-sm',
                            isActive ? 'bg-primary/20 text-primary font-semibold' : 'text-muted-foreground'
                        )}
                        >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        </Link>
                    );
                })}
            </CollapsibleContent>
        </Collapsible>
      </nav>
      <div className="p-4 mt-auto border-t">
        {/* User profile section could go here */}
      </div>
    </aside>
  );
}
