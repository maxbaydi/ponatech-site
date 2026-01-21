import type { BadgeProps } from '@/components/ui/badge';
import type { SupplyRequestStatus } from '@/lib/api/types';

export const REQUEST_STATUS_FILTER_ALL = 'ALL' as const;

export type RequestStatusFilter = SupplyRequestStatus | typeof REQUEST_STATUS_FILTER_ALL;

export const REQUEST_STATUS_META: Record<
  SupplyRequestStatus,
  { label: string; badgeVariant: BadgeProps['variant'] }
> = {
  NEW: { label: 'Новая', badgeVariant: 'warning' },
  IN_PROGRESS: { label: 'В работе', badgeVariant: 'info' },
  COMPLETED: { label: 'Выполнена', badgeVariant: 'success' },
  CANCELLED: { label: 'Отменена', badgeVariant: 'outline' },
};

export const REQUEST_STATUS_OPTIONS = (Object.keys(REQUEST_STATUS_META) as SupplyRequestStatus[]).map((status) => ({
  value: status,
  label: REQUEST_STATUS_META[status].label,
}));

export const getRequestStatusLabel = (status: SupplyRequestStatus) => REQUEST_STATUS_META[status].label;
export const getRequestStatusBadgeVariant = (status: SupplyRequestStatus) => REQUEST_STATUS_META[status].badgeVariant;
