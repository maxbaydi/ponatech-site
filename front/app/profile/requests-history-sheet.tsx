'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { SupplyRequest } from '@/lib/api/types';
import { formatDate } from '@/lib/utils';
import { formatRequestNumber } from '@/lib/requests/request-number';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { RequestMessage } from '@/components/requests/request-message';

const TITLE = 'Заявка';
const NUMBER_LABEL = 'Номер заявки';
const DATE_LABEL = 'Дата';
const STATUS_LABEL = 'Статус';
const MESSAGE_LABEL = 'Текст заявки';

interface RequestsHistorySheetProps {
  request: SupplyRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestsHistorySheet({ request, open, onOpenChange }: RequestsHistorySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          {request ? (
            <SheetTitle className="flex items-center gap-2 flex-wrap">
              <span>{TITLE}</span>
              <span className="text-muted-foreground font-normal">
                {formatRequestNumber(request.requestNumber, false)}
              </span>
              <span className="text-muted-foreground font-normal text-sm">
                от {formatDate(request.createdAt)}
              </span>
            </SheetTitle>
          ) : (
            <SheetTitle>{TITLE}</SheetTitle>
          )}
        </SheetHeader>

        {request && (
          <div className="mt-6 space-y-4">
            <div>
              <div className="text-xs text-muted-foreground">{NUMBER_LABEL}</div>
              <div className="text-sm">{formatRequestNumber(request.requestNumber, false)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{DATE_LABEL}</div>
              <div className="text-sm">{formatDate(request.createdAt)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{STATUS_LABEL}</div>
              <div className="mt-2">
                <RequestStatusBadge status={request.status} />
              </div>
            </div>
            <RequestMessage label={MESSAGE_LABEL} message={request.description} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
