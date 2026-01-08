'use client';
import Link from 'next/link';
import {
  Menu,
  UserCircle,
  ChevronDown,
  Home,
  Users,
  FileText,
  Settings,
  CreditCard,
  ArrowRightLeft
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';
import { Logo } from '../logo';
import type { UserRole } from '@/lib/types';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/transfers', label: 'Transfers', icon: ArrowRightLeft },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;
  const role = user?.role as UserRole;
  const unit = user?.unit;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };


  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-4 text-base font-medium">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Logo className="h-6 w-6" />
              <span className="text-primary font-headline">
                <div>Manipur Police</div>
                <div>Risk Fund</div>
              </span>
            </Link>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
                      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 relative">
                <UserCircle className="h-8 w-8" />
                <div className="text-left">
                  <p className="text-sm font-medium">{user?.name || role}</p>
                  {unit && <p className="text-xs text-muted-foreground">{unit} Unit</p>}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user?.email || 'My Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
