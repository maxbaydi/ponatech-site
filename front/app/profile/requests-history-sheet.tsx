'use client';

import { useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { SupplyRequest } from '@/lib/api/types';
import { cn, formatDate } from '@/lib/utils';
import { formatRequestNumber } from '@/lib/requests/request-number';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { RequestMessage } from '@/components/requests/request-message';
import { RequestAttachments } from '@/components/requests/request-attachments';
import { useDownloadSupplyRequestAttachments, useSupplyRequestAttachments } from '@/lib/hooks/use-request-attachments';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const TITLE = 'Заявка';
const NUMBER_LABEL = 'Номер заявки';
const DATE_LABEL = 'Дата';
const STATUS_LABEL = 'Статус';
const MESSAGE_LABEL = 'Текст запроса';
const ATTACHMENTS_LABEL = 'Файлы';
const ATTACHMENTS_EMPTY_LABEL = 'Файлов не прикреплено.';
const ATTACHMENTS_LOADING_LABEL = 'Загрузка файлов';
const ATTACHMENTS_DOWNLOAD_ALL_LABEL = 'Скачать все';
const ATTACHMENTS_OPEN_LABEL = 'Открыть';
const ATTACHMENTS_DOWNLOAD_LABEL = 'Скачать';
const ATTACHMENTS_ERROR_LABEL = 'Не удалось загрузить файлы';
const ATTACHMENTS_DOWNLOAD_ERROR_LABEL = 'Не удалось скачать файлы';

interface RequestsHistorySheetProps {
  request: SupplyRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const downloadBlob = (blob: Blob, filename: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export function RequestsHistorySheet({ request, open, onOpenChange }: RequestsHistorySheetProps) {
  const requestId = request?.id;
  const { data: attachments = [], isLoading: attachmentsLoading, error: attachmentsError } = useSupplyRequestAttachments(requestId);
  const downloadAttachments = useDownloadSupplyRequestAttachments();
  const attachmentsEmptyLabel = attachmentsLoading ? ATTACHMENTS_LOADING_LABEL : ATTACHMENTS_EMPTY_LABEL;
  const attachmentsErrorMessage = attachmentsError ? ATTACHMENTS_ERROR_LABEL : '';
  const downloadErrorMessage = downloadAttachments.isError ? ATTACHMENTS_DOWNLOAD_ERROR_LABEL : '';
  const downloadFilename = useMemo(() => {
    if (!requestId) return 'request-attachments.zip';
    const reference = request?.requestNumber ?? requestId;
    return `request-${reference}-attachments.zip`;
  }, [request?.requestNumber, requestId]);

  const handleDownloadAll = async () => {
    if (!requestId) return;
    try {
      const blob = await downloadAttachments.mutateAsync(requestId);
      downloadBlob(blob, downloadFilename);
    } catch {
      return;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl max-h-screen overflow-y-auto scrollbar-themed">
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
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="attachments" className="border-b-0">
                <AccordionTrigger className="rounded-lg px-2 hover:bg-muted/30 hover:no-underline">
                  {ATTACHMENTS_LABEL}
                </AccordionTrigger>
                <AccordionContent className="px-2">
                  <RequestAttachments
                    attachments={attachments}
                    emptyLabel={attachmentsEmptyLabel}
                    onDownloadAll={handleDownloadAll}
                    isDownloadAllPending={downloadAttachments.isPending}
                    downloadAllLabel={ATTACHMENTS_DOWNLOAD_ALL_LABEL}
                    openLabel={ATTACHMENTS_OPEN_LABEL}
                    downloadLabel={ATTACHMENTS_DOWNLOAD_LABEL}
                  />
                  {attachmentsErrorMessage && (
                    <p className="mt-2 text-sm text-destructive">{attachmentsErrorMessage}</p>
                  )}
                  {downloadErrorMessage && (
                    <p className="mt-2 text-sm text-destructive">{downloadErrorMessage}</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
