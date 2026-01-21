'use client';

import Image from 'next/image';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SupplyRequestAttachment } from '@/lib/api/types';
import { formatFileSize } from '@/lib/utils';
import { isRequestAttachmentImage } from '@/lib/requests/request-attachments';

interface RequestAttachmentsProps {
  label?: string;
  attachments: SupplyRequestAttachment[];
  onDownloadAll?: () => void;
  isDownloadAllPending?: boolean;
  emptyLabel?: string;
  downloadAllLabel?: string;
  openLabel?: string;
  downloadLabel?: string;
}

export function RequestAttachments({
  label,
  attachments,
  onDownloadAll,
  isDownloadAllPending,
  emptyLabel = 'No attachments added.',
  downloadAllLabel = 'Download all',
  openLabel = 'Open',
  downloadLabel = 'Download',
}: RequestAttachmentsProps) {
  const hasLabel = Boolean(label);
  const showDownloadAll = Boolean(onDownloadAll) && attachments.length > 0;
  const hasHeader = hasLabel || showDownloadAll;

  return (
    <div>
      {hasHeader && (
        <div
          className={`flex flex-wrap items-center gap-2 pt-1 ${
            hasLabel ? 'justify-between' : 'justify-end'
          }`}
        >
          {hasLabel && <div className="text-xs text-muted-foreground">{label}</div>}
          {showDownloadAll && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDownloadAll}
              disabled={isDownloadAllPending}
            >
              <Download className="mr-2 h-4 w-4" />
              {downloadAllLabel}
            </Button>
          )}
        </div>
      )}

      {attachments.length === 0 ? (
        <div className="mt-2 text-sm text-muted-foreground">{emptyLabel}</div>
      ) : (
        <div className="mt-3 space-y-3">
          {attachments.map((attachment) => {
            const isImage = isRequestAttachmentImage(attachment.mimeType);

            return (
              <div
                key={attachment.id}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-12 w-12 flex items-center justify-center rounded-md bg-muted text-muted-foreground">
                    {isImage ? (
                      <Image
                        src={attachment.url}
                        alt={attachment.originalName}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-md object-cover"
                        unoptimized
                      />
                    ) : (
                      <FileText className="h-6 w-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{attachment.originalName}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.size)} | {attachment.mimeType || 'unknown'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Button asChild variant="outline" size="sm">
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {openLabel}
                    </a>
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <a href={attachment.url} download={attachment.originalName}>
                      <Download className="mr-2 h-4 w-4" />
                      {downloadLabel}
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
