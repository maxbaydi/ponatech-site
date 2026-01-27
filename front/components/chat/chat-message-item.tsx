'use client';

import Image from 'next/image';
import { Download, FileText, Bot } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';
import type { ChatMessage, ChatMessageAttachment } from '@/lib/api/types';

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

function isImageAttachment(mimeType: string): boolean {
  return IMAGE_MIME_TYPES.includes(mimeType.toLowerCase());
}

interface ChatMessageItemProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

export function ChatMessageItem({ message, isCurrentUser }: ChatMessageItemProps) {
  const isSystem = message.senderType === 'SYSTEM';
  const hasContent = message.content.trim().length > 0;

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
          <Bot className="h-4 w-4" aria-hidden="true" />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'chat-box max-w-[75%] px-3 py-2 break-words animate-in fade-in-0 slide-in-from-bottom-2 duration-200',
        isCurrentUser
          ? 'self-end rounded-[18px_18px_4px_18px] bg-slate-800 text-white shadow-[0_4px_14px_rgba(0,0,0,0.22)]'
          : 'self-start rounded-[18px_18px_18px_4px] bg-slate-100 text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.09)]'
      )}
    >
      {hasContent && (
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      )}

      {message.attachments.length > 0 && (
        <div className={cn('space-y-2', hasContent && 'mt-2')}>
          {message.attachments.map((attachment) => (
            <ChatAttachmentItem
              key={attachment.id}
              attachment={attachment}
              isCurrentUser={isCurrentUser}
            />
          ))}
        </div>
      )}

      <span
        className={cn(
          'mt-1 block text-xs font-light italic',
          isCurrentUser
            ? 'text-end text-white/75'
            : 'text-foreground/60'
        )}
      >
        {formatMessageTime(message.createdAt)}
      </span>
    </div>
  );
}

interface ChatAttachmentItemProps {
  attachment: ChatMessageAttachment;
  isCurrentUser: boolean;
}

function ChatAttachmentItem({ attachment, isCurrentUser }: ChatAttachmentItemProps) {
  const isImage = isImageAttachment(attachment.mimeType);

  if (isImage) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
        aria-label={`Открыть ${attachment.originalName}`}
        title={attachment.originalName}
      >
        <Image
          src={attachment.url}
          alt={attachment.originalName}
          width={200}
          height={150}
          className="object-cover chat-attachment-preview"
          unoptimized
        />
      </a>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg p-2 text-sm',
        isCurrentUser
          ? 'bg-white/10'
          : 'bg-background border'
      )}
    >
      <FileText className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
      <span className="truncate chat-attachment-name flex-1">{attachment.originalName}</span>
      <span className="text-xs opacity-70 shrink-0">
        {formatFileSize(attachment.size)}
      </span>
      <a
        href={attachment.url}
        download={attachment.originalName}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
        aria-label={`Скачать ${attachment.originalName}`}
        title={`Скачать ${attachment.originalName}`}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  );
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}
