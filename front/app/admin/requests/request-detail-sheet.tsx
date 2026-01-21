'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { SupplyRequest, SupplyRequestStatus } from '@/lib/api/types';
import { formatDate } from '@/lib/utils';
import { EMPTY_COMPANY } from './request-constants';
import { RequestContact } from './request-contact';
import { formatRequestNumber } from '@/lib/requests/request-number';
import { RequestMessage } from '@/components/requests/request-message';
import { RequestStatusSelect } from './request-status-select';
import { REQUEST_STATUS_FILTER_ALL } from '@/lib/requests/request-status';

const TITLE = 'Заявка';
const CONTACT_LABEL = 'Контакт';
const REQUEST_NUMBER_LABEL = 'Номер заявки';
const COMPANY_LABEL = 'Компания';
const STATUS_LABEL = 'Статус';
const REQUEST_LABEL = 'Текст заявки';
const COPY_LABEL = 'Скопировать всё';
const COPIED_LABEL = 'Скопировано';
const COPY_RESET_DELAY_MS = 1800;

const COPY_REQUEST_PREFIX = 'Заявка от';
const COPY_NUMBER_LABEL = 'Номер заявки';
const COPY_EMAIL_LABEL = 'Email';
const COPY_PHONE_LABEL = 'Телефон';
const COPY_COMPANY_LABEL = 'Компания';
const COPY_MESSAGE_LABEL = 'Запрос';

interface RequestDetailSheetProps {
  request: SupplyRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: SupplyRequestStatus) => void;
  isUpdating?: boolean;
}

const buildCopyText = (request: SupplyRequest) => {
  const company = request.company?.trim() ? request.company : EMPTY_COMPANY;

  return [
    `${COPY_REQUEST_PREFIX} ${request.name}`,
    `${COPY_NUMBER_LABEL}: ${formatRequestNumber(request.requestNumber, false)}`,
    `${COPY_EMAIL_LABEL}: ${request.email}`,
    `${COPY_PHONE_LABEL}: ${request.phone}`,
    `${COPY_COMPANY_LABEL}: ${company}`,
    '',
    `${COPY_MESSAGE_LABEL}:`,
    request.description,
  ].join('\n');
};

export function RequestDetailSheet({
  request,
  open,
  onOpenChange,
  onStatusChange,
  isUpdating,
}: RequestDetailSheetProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timeout = window.setTimeout(() => setCopied(false), COPY_RESET_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const handleCopy = async () => {
    if (!request) return;
    try {
      await navigator.clipboard.writeText(buildCopyText(request));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleStatusChange = (value: SupplyRequestStatus | typeof REQUEST_STATUS_FILTER_ALL) => {
    if (!request || value === REQUEST_STATUS_FILTER_ALL) return;
    onStatusChange(request.id, value);
  };

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
          <div className="mt-6 space-y-5">
            <div>
              <div className="text-xs text-muted-foreground">{CONTACT_LABEL}</div>
              <RequestContact request={request} variant="sheet" className="mt-2" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{REQUEST_NUMBER_LABEL}</div>
              <div className="text-sm">{formatRequestNumber(request.requestNumber, false)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{COMPANY_LABEL}</div>
              <div className="text-sm">{request.company || EMPTY_COMPANY}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{STATUS_LABEL}</div>
              <RequestStatusSelect
                value={request.status}
                onChange={handleStatusChange}
                className="mt-2 sm:max-w-[220px]"
                disabled={isUpdating}
              />
            </div>
            <RequestMessage label={REQUEST_LABEL} message={request.description} />
            <Button variant="secondary" onClick={handleCopy}>
              {copied ? COPIED_LABEL : COPY_LABEL}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
