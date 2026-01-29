'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SupplyRequest } from '@/lib/api/types';
import { formatDate, truncate } from '@/lib/utils';
import { EMPTY_COMPANY } from './request-constants';
import { RequestContact } from './request-contact';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { formatRequestNumber } from '@/lib/requests/request-number';

interface RequestCardProps {
  request: SupplyRequest;
  onOpenChat?: (request: SupplyRequest) => void;
  descriptionPreviewLength: number;
  detailsLabel: string;
  detailsHref: string;
  detailsDisabled?: boolean;
  chatLabel?: string;
}

const COMPANY_LABEL = 'Компания';
const REQUEST_LABEL = 'Текст запроса';

export function RequestCard({
  request,
  onOpenChat,
  descriptionPreviewLength,
  detailsLabel,
  detailsHref,
  detailsDisabled = false,
  chatLabel = 'Чат',
}: RequestCardProps) {
  const unreadCount = request.unreadCount ?? 0;
  const requestNumberLabel = formatRequestNumber(request.requestNumber, false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">{formatDate(request.createdAt)}</div>
            {detailsDisabled ? (
              <div className="text-xs text-muted-foreground">{requestNumberLabel}</div>
            ) : (
              <Link
                href={detailsHref}
                className="text-xs text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors hover:text-foreground"
              >
                {requestNumberLabel}
              </Link>
            )}
            <RequestContact request={request} variant="card" className="mt-2" />
          </div>
          <RequestStatusBadge status={request.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-xs text-muted-foreground">{COMPANY_LABEL}</div>
          <div className="text-sm">{request.company || EMPTY_COMPANY}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{REQUEST_LABEL}</div>
          <div className="text-sm text-muted-foreground line-clamp-2">
            {truncate(request.description, descriptionPreviewLength)}
          </div>
        </div>
        <div className="flex gap-2">
          {detailsDisabled ? (
            <Button variant="outline" size="sm" disabled>
              {detailsLabel}
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href={detailsHref}>{detailsLabel}</Link>
            </Button>
          )}
          {onOpenChat && (
            <div className="relative inline-block">
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1.5 -right-1 min-w-5 h-5 px-1 z-10"
                >
                  {unreadCount}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => onOpenChat(request)}>
                <MessageCircle className="mr-1 h-4 w-4" aria-hidden="true" />
                <span>{chatLabel}</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
