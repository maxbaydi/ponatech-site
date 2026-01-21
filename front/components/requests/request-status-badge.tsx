'use client';

import { Badge } from '@/components/ui/badge';
import type { SupplyRequestStatus } from '@/lib/api/types';
import { getRequestStatusBadgeVariant, getRequestStatusLabel } from '@/lib/requests/request-status';

interface RequestStatusBadgeProps {
  status: SupplyRequestStatus;
  className?: string;
}

export function RequestStatusBadge({ status, className }: RequestStatusBadgeProps) {
  return (
    <Badge variant={getRequestStatusBadgeVariant(status)} className={className}>
      {getRequestStatusLabel(status)}
    </Badge>
  );
}
