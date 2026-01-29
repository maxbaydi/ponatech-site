'use client';

import Link from 'next/link';
import { ClipboardList, MessageCircle, Package, Bell, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useChatStats } from '@/lib/hooks/use-chat';
import { useNotificationStats } from '@/lib/hooks/use-notifications';
import { useProducts } from '@/lib/hooks/use-products';
import { useSupplyRequestsStats } from '@/lib/hooks/use-supply-requests';
import { useUsersStats } from '@/lib/hooks/use-users';

const PAGE_TITLE = 'Дашборд';
const PAGE_DESCRIPTION = 'Ключевые показатели и быстрые действия';
const REQUESTS_TITLE = 'Новые заявки';
const USERS_TITLE = 'Новые пользователи';
const PRODUCTS_TITLE = 'Всего товаров';
const PRODUCTS_DESCRIPTION = 'В каталоге';
const CHATS_TITLE = 'Чаты';
const CHATS_DESCRIPTION_TOTAL = (n: number) => `Всего чатов: ${n}`;
const CHATS_BADGE_UNREAD = 'Непрочитанные';
const NOTIFICATIONS_TITLE = 'Уведомления';
const NOTIFICATIONS_DESCRIPTION_TOTAL = (n: number) => `Всего: ${n}`;
const NOTIFICATIONS_BADGE_UNREAD = 'Непрочитанные';
const ACTIONS_TITLE = 'Быстрые действия';
const ACTIONS_DESCRIPTION = 'Переход к работе с заявками и чатами';
const ACTIONS_REQUESTS_LABEL = 'К заявкам';
const ACTIONS_CHATS_LABEL = 'К чатам';
const REQUESTS_ATTENTION_LABEL = 'Требуют внимания';
const REQUESTS_CLEAR_LABEL = 'Новых нет';
const PERIOD_PREFIX = 'За последние';
const PERIOD_SUFFIX = 'дн.';
const PRODUCTS_COUNT_PAGE = 1;
const PRODUCTS_COUNT_LIMIT = 1;
const DEFAULT_STATS_DAYS = 7;
const EMPTY_COUNT = 0;
const BADGE_VARIANT_ATTENTION: BadgeProps['variant'] = 'destructive';
const BADGE_VARIANT_OK: BadgeProps['variant'] = 'secondary';

type StatBadge = {
  label: string;
  variant: BadgeProps['variant'];
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  badge?: StatBadge;
  cardClassName?: string;
}

const formatPeriodLabel = (days: number): string => `${PERIOD_PREFIX} ${days} ${PERIOD_SUFFIX}`;

function StatCard({ title, value, icon, description, badge, cardClassName }: StatCardProps) {
  return (
    <Card className={cardClassName}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || badge) && (
          <div className="mt-2 flex flex-col items-start gap-1 text-xs text-muted-foreground">
            {description && <span>{description}</span>}
            {badge && (
              <Badge variant={badge.variant} className="min-w-0 max-w-full whitespace-normal break-words text-left w-fit">
                {badge.label}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: allProductsPage } = useProducts({ page: PRODUCTS_COUNT_PAGE, limit: PRODUCTS_COUNT_LIMIT });
  const { data: requestsStats } = useSupplyRequestsStats();
  const { data: usersStats } = useUsersStats();
  const { data: chatStats } = useChatStats();
  const { data: notificationStats } = useNotificationStats();

  const totalProducts = allProductsPage?.total ?? EMPTY_COUNT;
  const newRequests = requestsStats?.newRequests ?? EMPTY_COUNT;
  const newUsers = usersStats?.newUsers ?? EMPTY_COUNT;
  const requestsPeriodDays = requestsStats?.periodDays ?? DEFAULT_STATS_DAYS;
  const usersPeriodDays = usersStats?.periodDays ?? DEFAULT_STATS_DAYS;
  const totalChats = chatStats?.totalChats ?? EMPTY_COUNT;
  const unreadChats = chatStats?.unreadChats ?? EMPTY_COUNT;
  const notificationsTotal = notificationStats?.total ?? EMPTY_COUNT;
  const notificationsUnread = notificationStats?.unread ?? EMPTY_COUNT;
  const requestsBadge: StatBadge = newRequests > EMPTY_COUNT
    ? { label: REQUESTS_ATTENTION_LABEL, variant: BADGE_VARIANT_ATTENTION }
    : { label: REQUESTS_CLEAR_LABEL, variant: BADGE_VARIANT_OK };
  const chatsBadge: StatBadge | undefined = unreadChats > EMPTY_COUNT
    ? { label: CHATS_BADGE_UNREAD, variant: BADGE_VARIANT_ATTENTION }
    : undefined;
  const notificationsBadge: StatBadge | undefined = notificationsUnread > EMPTY_COUNT
    ? { label: NOTIFICATIONS_BADGE_UNREAD, variant: BADGE_VARIANT_ATTENTION }
    : undefined;

  const statsCards: StatCardProps[] = [
    {
      title: REQUESTS_TITLE,
      value: newRequests,
      icon: <ClipboardList className="h-4 w-4 text-muted-foreground" />,
      description: formatPeriodLabel(requestsPeriodDays),
      badge: requestsBadge,
    },
    {
      title: USERS_TITLE,
      value: newUsers,
      icon: <UserPlus className="h-4 w-4 text-muted-foreground" />,
      description: formatPeriodLabel(usersPeriodDays),
    },
    {
      title: PRODUCTS_TITLE,
      value: totalProducts,
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
      description: PRODUCTS_DESCRIPTION,
    },
    {
      title: CHATS_TITLE,
      value: unreadChats,
      icon: <MessageCircle className="h-4 w-4 text-muted-foreground" />,
      description: CHATS_DESCRIPTION_TOTAL(totalChats),
      badge: chatsBadge,
    },
    {
      title: NOTIFICATIONS_TITLE,
      value: notificationsUnread,
      icon: <Bell className="h-4 w-4 text-muted-foreground" />,
      description: NOTIFICATIONS_DESCRIPTION_TOTAL(notificationsTotal),
      badge: notificationsBadge,
    },
  ];

  return (
    <div className="max-w-[1076px] p-[6px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{PAGE_TITLE}</h1>
        <p className="text-muted-foreground">{PAGE_DESCRIPTION}</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        {statsCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            description={card.description}
            badge={card.badge}
            cardClassName={card.title === REQUESTS_TITLE ? 'w-[200px] min-w-[200px] h-[160px]' : 'min-w-[200px] h-[160px]'}
          />
        ))}
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{ACTIONS_TITLE}</CardTitle>
            <CardDescription>{ACTIONS_DESCRIPTION}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/admin/requests">{ACTIONS_REQUESTS_LABEL}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/chats">{ACTIONS_CHATS_LABEL}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
