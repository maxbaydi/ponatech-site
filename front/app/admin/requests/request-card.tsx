'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { SupplyRequest } from '@/lib/api/types';
import { formatDate, truncate } from '@/lib/utils';
import { EMPTY_COMPANY } from './request-constants';
import { RequestContact } from './request-contact';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { formatRequestNumber } from '@/lib/requests/request-number';

interface RequestCardProps {
  request: SupplyRequest;
  onOpen: (request: SupplyRequest) => void;
  descriptionPreviewLength: number;
  detailsLabel: string;
}

const COMPANY_LABEL = 'Компания';
const REQUEST_LABEL = 'Текст заявки';

export function RequestCard({ request, onOpen, descriptionPreviewLength, detailsLabel }: RequestCardProps) {
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
          <div className="text-sm text-muted-foreground">
            {truncate(request.description, descriptionPreviewLength)}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => onOpen(request)}>
          {detailsLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
