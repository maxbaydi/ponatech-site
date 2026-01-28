'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, MessageCircle, ClipboardList, RefreshCw, Trash2, EyeOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  useNotifications,
  useNotificationStats,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/lib/hooks/use-notifications';
import {
  buildProfileNotificationHref,
  PROFILE_VIEW_CHAT,
  PROFILE_VIEW_DETAILS,
} from '@/lib/requests/profile-navigation';
import type { Notification, NotificationType } from '@/lib/api/types';

type NotificationsDropdownMode = 'admin' | 'client';

interface NotificationsDropdownProps {
  mode?: NotificationsDropdownMode;
}

const CLIENT_NOTIFICATION_TYPES: NotificationType[] = ['NEW_MESSAGE', 'STATUS_CHANGE'];
const DEFAULT_LIMIT = 10;
const LIMIT_STEP = 10;

const NOTIFICATION_ICONS: Record<NotificationType, typeof Bell> = {
  NEW_MESSAGE: MessageCircle,
  STATUS_CHANGE: RefreshCw,
  NEW_REQUEST: ClipboardList,
};

const NOTIFICATION_TYPE_META: Record<
  NotificationType,
  { label: string; badgeVariant: 'info' | 'success' | 'warning'; borderClass: string; iconBgClass: string }
> = {
  NEW_MESSAGE: { label: 'Сообщение', badgeVariant: 'info', borderClass: 'border-l-info', iconBgClass: 'bg-info/15 text-info' },
  NEW_REQUEST: { label: 'Заявка', badgeVariant: 'success', borderClass: 'border-l-success', iconBgClass: 'bg-success/15 text-success' },
  STATUS_CHANGE: { label: 'Статус', badgeVariant: 'warning', borderClass: 'border-l-warning', iconBgClass: 'bg-warning/15 text-warning' },
};

export function NotificationsDropdown({ mode = 'admin' }: NotificationsDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: stats } = useNotificationStats();
  const { data: notificationsData, isLoading } = useNotifications({
    limit,
    unreadOnly: unreadOnly || undefined,
  });
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const notifications = notificationsData?.data ?? [];
  const notificationsTotal = notificationsData?.total ?? notifications.length;
  const canLoadMore = notifications.length < notificationsTotal;
  const visibleNotifications =
    mode === 'client'
      ? notifications.filter((notification) => CLIENT_NOTIFICATION_TYPES.includes(notification.type))
      : notifications;
  const unreadCount = stats?.unread ?? 0;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }

    if (notification.requestId) {
      if (mode === 'client') {
        const view = notification.type === 'NEW_MESSAGE' ? PROFILE_VIEW_CHAT : PROFILE_VIEW_DETAILS;
        router.push(
          buildProfileNotificationHref({
            requestId: notification.requestId,
            requestNumber: notification.requestNumber,
            view,
          })
        );
      } else if (notification.type === 'NEW_MESSAGE') {
        router.push(`/admin/chats?request=${notification.requestId}`);
      } else {
        router.push('/admin/requests');
      }
    }

    setOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleClearNotifications = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => {
        setUnreadOnly(true);
        setLimit(DEFAULT_LIMIT);
      },
    });
  };

  const handleToggleUnreadOnly = () => {
    setUnreadOnly((prev) => {
      const next = !prev;
      if (next) {
        setLimit(DEFAULT_LIMIT);
      }
      return next;
    });
  };

  const handleLoadMore = () => {
    setLimit((prev) => prev + LIMIT_STEP);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Уведомления">
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span>Уведомления</span>
            <TooltipProvider delayDuration={1000} skipDelayDuration={0}>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto py-1 px-2 text-xs"
                        onClick={handleMarkAllAsRead}
                        disabled={markAllAsRead.isPending}
                        aria-label="Прочитать все"
                      >
                        <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Прочитать все</TooltipContent>
                  </Tooltip>
                )}
                {notificationsTotal > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto py-1 px-2 text-xs"
                        onClick={handleClearNotifications}
                        disabled={markAllAsRead.isPending}
                        aria-label="Очистить"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Очистить</TooltipContent>
                  </Tooltip>
                )}
                {notificationsTotal > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto py-1 px-2 text-xs"
                        onClick={handleToggleUnreadOnly}
                        aria-label={unreadOnly ? 'Показать все' : 'Скрыть прочитанные'}
                      >
                        {unreadOnly ? (
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {unreadOnly ? 'Показать все' : 'Скрыть прочитанные'}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Загрузка…</div>
        ) : visibleNotifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Нет уведомлений</div>
        ) : (
          <ScrollArea className="h-80">
            <div className="pr-3">
              {visibleNotifications.map((notification) => {
                const Icon = NOTIFICATION_ICONS[notification.type] ?? Bell;
                const meta = NOTIFICATION_TYPE_META[notification.type] ?? NOTIFICATION_TYPE_META.NEW_MESSAGE;

                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      'flex items-start gap-3 p-3 pl-2.5 cursor-pointer border-l-4 border-l-transparent',
                      meta.borderClass,
                      !notification.isRead && 'bg-muted/50'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div
                      className={cn(
                        'shrink-0 h-8 w-8 flex items-center justify-center rounded-full',
                        meta.iconBgClass,
                        notification.isRead && 'opacity-70'
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Badge variant={meta.badgeVariant} className="text-[10px] px-1.5 py-0 font-medium shrink-0">
                          {meta.label}
                        </Badge>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" aria-hidden />
                        )}
                      </div>
                      <span className="font-medium text-sm truncate block mt-0.5">{notification.title}</span>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
              {canLoadMore && (
                <div className="py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    Показать еще
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Только что';
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays < 7) return `${diffDays} дн. назад`;

  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}
