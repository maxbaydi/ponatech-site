'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  Building2,
  FolderTree,
  Image as ImageIcon,
  Users,
  ChevronLeft,
  Menu,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-context';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Дашборд', href: '/admin/dashboard' },
  { icon: Package, label: 'Товары', href: '/admin/manage-products' },
  { icon: Building2, label: 'Бренды', href: '/admin/manage-brands' },
  { icon: FolderTree, label: 'Категории', href: '/admin/manage-categories' },
  { icon: ImageIcon, label: 'Медиабиблиотека', href: '/admin/media' },
];

const ADMIN_NAV_ITEMS = [{ icon: Users, label: 'Пользователи', href: '/admin/users' }];

function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/ponatech-logo-rectangular.PNG"
            alt="Pona Tech"
            width={120}
            height={34}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}

          {isAdmin && (
            <>
              <Separator className="my-4" />
              {ADMIN_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>
      </ScrollArea>

      <Separator />

      <div className="p-4 space-y-2">
        <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href="/">
              <ChevronLeft className="h-4 w-4 mr-1" />
              На сайт
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isManager } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isManager)) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, isManager, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isManager) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-64 border-r bg-background flex-col">
        <AdminSidebar />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b bg-background flex items-center px-4 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Меню администратора</SheetTitle>
              <AdminSidebar />
            </SheetContent>
          </Sheet>
          <span className="ml-4 font-semibold">Админ-панель</span>
        </header>

        <main className="flex-1 p-4 lg:p-6 bg-muted/30">{children}</main>
      </div>
    </div>
  );
}
