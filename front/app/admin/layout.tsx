'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  Building2,
  FolderTree,
  ClipboardList,
  Image as ImageIcon,
  Settings,
  Users,
  ChevronLeft,
  Menu,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-context';
import { NotificationsDropdown } from '@/components/notifications';
import { useChatStats } from '@/lib/hooks/use-chat';

type AdminNavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
};

type AdminSidebarProps = {
  className?: string;
  onNavClick?: () => void;
  compact?: boolean;
  onToggleCompact?: () => void;
  chatUnreadCount?: number;
};

const NAV_ITEMS: AdminNavItem[] = [
  { icon: LayoutDashboard, label: 'Дашборд', href: '/admin/dashboard' },
  { icon: Package, label: 'Товары', href: '/admin/manage-products' },
  { icon: Building2, label: 'Бренды', href: '/admin/manage-brands' },
  { icon: FolderTree, label: 'Категории', href: '/admin/manage-categories' },
  { icon: ClipboardList, label: 'Заявки', href: '/admin/requests' },
  { icon: MessageCircle, label: 'Чаты', href: '/admin/chats' },
  { icon: ImageIcon, label: 'Медиабиблиотека', href: '/admin/media' },
  { icon: Settings, label: 'Настройки', href: '/admin/settings' },
];


const ADMIN_NAV_ITEMS: AdminNavItem[] = [{ icon: Users, label: 'Пользователи', href: '/admin/users' }];

const ADMIN_SIDEBAR_COMPACT_STORAGE_KEY = 'admin-sidebar-compact';
const COMPACT_COLLAPSE_LABEL = 'Свернуть меню';
const COMPACT_EXPAND_LABEL = 'Развернуть меню';
const BACK_TO_SITE_LABEL = 'На сайт';
const LOGOUT_LABEL = 'Выйти';

function AdminSidebar({
  className,
  onNavClick,
  compact = false,
  onToggleCompact,
  chatUnreadCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const toggleLabel = compact ? COMPACT_EXPAND_LABEL : COMPACT_COLLAPSE_LABEL;

  const handleNavClick = () => {
    onNavClick?.();
  };

  const renderNavItem = (item: AdminNavItem) => {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const showChatBadge = item.href === '/admin/chats' && chatUnreadCount > 0;
    if (!compact) {
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={handleNavClick}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'flex items-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isActive ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            'gap-3 px-3 py-2'
          )}
        >
          <item.icon className="h-4 w-4" />
          <span className="truncate flex-1">{item.label}</span>
          {showChatBadge && (
            <Badge variant="destructive" className="min-w-5 h-5 px-1">
              {chatUnreadCount}
            </Badge>
          )}
        </Link>
      );
    }

    const link = (
      <Link
        href={item.href}
        onClick={handleNavClick}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isActive ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <item.icon className="h-4 w-4" />
        {showChatBadge && (
          <Badge variant="destructive" className="absolute -top-1 -right-1 min-w-4 h-4 px-1">
            {chatUnreadCount}
          </Badge>
        )}
        <span className="sr-only">{item.label}</span>
      </Link>
    );

    return (
      <Tooltip key={item.href}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn('flex flex-col h-full', className)}>
        <div
          className={cn(
            'flex items-center pb-3',
            compact ? 'flex-col gap-3 px-2 pt-4' : 'justify-between px-4 pt-4'
          )}
        >
          <Link href="/" className="flex items-center gap-2" onClick={handleNavClick}>
            {compact ? (
              <Image
                src="/assets/ponatech-logo-square.webp"
                alt="Pona Tech"
                width={32}
                height={32}
                className="h-8 w-8"
              />
            ) : (
              <Image
                src="/assets/ponatech-logo-rectangular.webp"
                alt="Pona Tech"
                width={120}
                height={34}
                className="h-8 w-auto"
              />
            )}
          </Link>
          {onToggleCompact && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onToggleCompact} aria-label={toggleLabel}>
                  {compact ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={compact ? 'right' : 'bottom'}>{toggleLabel}</TooltipContent>
            </Tooltip>
          )}
        </div>

        <Separator />

        <ScrollArea className={cn('flex-1 min-h-0', compact ? 'px-2 py-3' : 'px-3 py-4')}>
          <nav className={cn('flex flex-col gap-1', compact && 'items-center')}>
            {NAV_ITEMS.map((item) => renderNavItem(item))}


            {isAdmin && (
              <>
                <Separator className={cn('my-4', compact && 'mx-2')} />
                {ADMIN_NAV_ITEMS.map((item) => renderNavItem(item))}
              </>
            )}
          </nav>
        </ScrollArea>

        <Separator />

        <div className={cn('space-y-2', compact ? 'p-3' : 'p-4')}>
          <div className={cn('text-xs text-muted-foreground truncate', compact && 'sr-only')}>{user?.email}</div>
          <div className={cn('flex gap-2', compact && 'flex-col items-center')}>
            {compact ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" asChild>
                    <Link href="/" onClick={handleNavClick} aria-label={BACK_TO_SITE_LABEL}>
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{BACK_TO_SITE_LABEL}</TooltipContent>
              </Tooltip>
            ) : (
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/" onClick={handleNavClick}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {BACK_TO_SITE_LABEL}
                </Link>
              </Button>
            )}
            {compact ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={logout} aria-label={LOGOUT_LABEL}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{LOGOUT_LABEL}</TooltipContent>
              </Tooltip>
            ) : (
              <Button variant="ghost" size="icon" onClick={logout} aria-label={LOGOUT_LABEL}>
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isManager } = useAuth();
  const { data: chatStats } = useChatStats({ enabled: isAuthenticated && isManager });
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(ADMIN_SIDEBAR_COMPACT_STORAGE_KEY);
      if (stored === '1') {
        setIsCompact(true);
      }
    } catch {
      setIsCompact(false);
    }
  }, []);

  const handleToggleCompact = () => {
    setIsCompact((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(ADMIN_SIDEBAR_COMPACT_STORAGE_KEY, next ? '1' : '0');
        } catch {
        }
      }
      return next;
    });
  };

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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="admin-shell flex flex-1 min-h-0 flex-col gap-4 lg:flex-row lg:gap-6">
        <aside
          className={cn(
            'admin-sidebar-frame admin-sidebar-sticky hidden lg:flex flex-col rounded-2xl border bg-background shadow-sm overflow-hidden self-start transition-all duration-200',
            isCompact ? 'w-16' : 'w-64'
          )}
        >
          <AdminSidebar
            compact={isCompact}
            onToggleCompact={handleToggleCompact}
            chatUnreadCount={chatStats?.unreadChats ?? 0}
          />
        </aside>

        <div className="flex flex-1 min-h-0 min-w-0 flex-col gap-4">
          <header className="flex h-14 items-center gap-2 rounded-2xl border bg-background px-4 shadow-sm lg:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-64 p-0">
                <SheetTitle className="sr-only">Меню администратора</SheetTitle>
                <AdminSidebar
                  compact={false}
                  onNavClick={() => setSheetOpen(false)}
                  chatUnreadCount={chatStats?.unreadChats ?? 0}
                />
              </SheetContent>
            </Sheet>
            <span className="ml-2 font-semibold truncate flex-1">Админ-панель</span>
            <NotificationsDropdown />
          </header>

          <header className="hidden lg:flex h-14 items-center justify-between rounded-2xl border bg-background px-4 shadow-sm shrink-0">
            <span className="font-semibold">Админ-панель</span>
            <NotificationsDropdown />
          </header>

          <div className="flex flex-1 min-h-0 flex-col admin-content w-full max-w-[1248px] mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
