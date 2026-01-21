'use client';

import type { SupplyRequest } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const COMPACT_VARIANT = {
  container: 'space-y-1',
  name: 'text-base font-semibold',
  detail: 'text-sm text-muted-foreground break-all',
};

const CONTACT_VARIANTS = {
  table: {
    container: 'space-y-1',
    name: 'font-medium text-sm sm:text-base',
    detail: 'text-xs text-muted-foreground break-all',
  },
  card: COMPACT_VARIANT,
  sheet: COMPACT_VARIANT,
} as const;

interface RequestContactProps {
  request: SupplyRequest;
  variant?: keyof typeof CONTACT_VARIANTS;
  className?: string;
}

export function RequestContact({ request, variant = 'table', className }: RequestContactProps) {
  const styles = CONTACT_VARIANTS[variant];

  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.name}>{request.name}</div>
      <div className={styles.detail}>{request.email}</div>
      <div className={styles.detail}>{request.phone}</div>
    </div>
  );
}
