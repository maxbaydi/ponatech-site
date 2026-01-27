'use client';

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
  onOpen: (request: SupplyRequest) => void;
  onOpenChat?: (request: SupplyRequest) => void;
  descriptionPreviewLength: number;
  detailsLabel: string;
  chatLabel?: string;
}

const COMPANY_LABEL = 'Компания';
const REQUEST_LABEL = 'Текст запроса';

export function RequestCard({
  request,
  onOpen,
  onOpenChat,
  descriptionPreviewLength,
  detailsLabel,
  chatLabel = 'Чат',
}: RequestCardProps) {
  const unreadCount = request.unreadCount ?? 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">{formatDate(request.createdAt)}</div>
            <div className="text-xs text-muted-foreground">{formatRequestNumber(request.requestNumber, false)}</div>
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
          <Button variant="outline" size="sm" onClick={() => onOpen(request)}>
            {detailsLabel}
          </Button>
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
