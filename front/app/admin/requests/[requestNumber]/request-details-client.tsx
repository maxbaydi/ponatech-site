'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ClipboardCopy, Download, MessageCircle, Hash, CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { RequestMessage } from '@/components/requests/request-message';
import { RequestAttachments } from '@/components/requests/request-attachments';
import { RequestStatusSelect } from '../request-status-select';
import { RequestContact } from '../request-contact';
import { ChatMessagesList } from '@/components/chat/chat-messages-list';
import { ChatInput } from '@/components/chat/chat-input';
import { useSupplyRequestByNumber, useUpdateSupplyRequestStatus } from '@/lib/hooks/use-supply-requests';
import { useSupplyRequestAttachments, useDownloadSupplyRequestAttachments } from '@/lib/hooks/use-request-attachments';
import { useChatMessages, useSendMessage, useMarkChatAsRead } from '@/lib/hooks/use-chat';
import { useAuth } from '@/lib/auth/auth-context';
import { REQUEST_STATUS_FILTER_ALL } from '@/lib/requests/request-status';
import { formatRequestNumber } from '@/lib/requests/request-number';
import { formatDate } from '@/lib/utils';
import { isApiError } from '@/lib/api/errors';
import type { ChatMessage, SupplyRequest, SupplyRequestStatus } from '@/lib/api/types';
import { EMPTY_COMPANY } from '../request-constants';

const PAGE_TITLE = 'Заявка';
const BACK_LABEL = 'К заявкам';
const META_TITLE = 'Карточка заявки';
const META_DESCRIPTION = 'Ключевые параметры и контактные данные клиента.';
const REQUEST_MESSAGE_TITLE = 'Запрос клиента';
const REQUEST_MESSAGE_LABEL = 'Комментарий';
const ATTACHMENTS_TITLE = 'Файлы';
const ATTACHMENTS_DESCRIPTION = 'Материалы, прикрепленные к заявке.';
const CHAT_TITLE = 'Чат по заявке';
const CHAT_DESCRIPTION = 'История общения и быстрый ответ клиенту.';
const STATUS_LABEL = 'Статус';
const COMPANY_LABEL = 'Компания';
const CONTACT_LABEL = 'Контакт';
const NUMBER_LABEL = 'Номер';
const DATE_LABEL = 'Дата';
const COPY_LABEL = 'Скопировать';
const COPIED_LABEL = 'Скопировано';
const COPY_RESET_DELAY_MS = 1800;
const ATTACHMENTS_EMPTY_LABEL = 'Файлы не прикреплены.';
const ATTACHMENTS_LOADING_LABEL = 'Загрузка файлов...';
const ATTACHMENTS_DOWNLOAD_ALL_LABEL = 'Скачать все';
const ATTACHMENTS_OPEN_LABEL = 'Открыть';
const ATTACHMENTS_DOWNLOAD_LABEL = 'Скачать';
const REQUEST_NOT_FOUND_TITLE = 'Заявка не найдена';
const REQUEST_NOT_FOUND_DESCRIPTION = 'Проверьте номер заявки или вернитесь к списку.';
const REQUEST_ERROR_TITLE = 'Не удалось загрузить заявку';
const REQUEST_ERROR_DESCRIPTION = 'Попробуйте обновить страницу или вернуться к списку заявок.';
const CHAT_PLACEHOLDER = 'Введите сообщение для клиента...';

const COPY_REQUEST_PREFIX = 'Заявка от';
const COPY_NUMBER_LABEL = 'Номер заявки';
const COPY_EMAIL_LABEL = 'Email';
const COPY_PHONE_LABEL = 'Телефон';
const COPY_COMPANY_LABEL = 'Компания';
const COPY_MESSAGE_LABEL = 'Сообщение';
const REQUEST_NUMBER_PREFIX = '№';

interface RequestDetailsClientProps {
  requestNumber: string;
}

const normalizeRequestNumberInput = (value: string): string => {
  const trimmed = value.trim();
  const withoutSpaces = trimmed.replace(/\s+/g, '');
  if (withoutSpaces.startsWith(REQUEST_NUMBER_PREFIX)) {
    return withoutSpaces.slice(REQUEST_NUMBER_PREFIX.length).trim();
  }
  return withoutSpaces;
};

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

const downloadBlob = (blob: Blob, filename: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export function RequestDetailsClient({ requestNumber }: RequestDetailsClientProps) {
  const decodedRequestNumber = useMemo(() => decodeURIComponent(requestNumber).trim(), [requestNumber]);
  const normalizedRequestNumber = useMemo(
    () => normalizeRequestNumberInput(decodedRequestNumber),
    [decodedRequestNumber]
  );
  const requestQuery = useSupplyRequestByNumber(normalizedRequestNumber, {
    enabled: Boolean(normalizedRequestNumber),
  });

  const isLoading = requestQuery.isLoading;
  const error = requestQuery.error ?? null;
  const notFound = isApiError(error) && error.status === 404;
  const request = requestQuery.data ?? null;
  const updateStatus = useUpdateSupplyRequestStatus();

  const [copied, setCopied] = useState(false);
  const [statusOverride, setStatusOverride] = useState<SupplyRequestStatus | null>(null);
  const statusValue = statusOverride ?? request?.status;

  const { data: attachments = [], isLoading: attachmentsLoading } = useSupplyRequestAttachments(request?.id);
  const downloadAttachments = useDownloadSupplyRequestAttachments();
  const attachmentsEmptyLabel = attachmentsLoading ? ATTACHMENTS_LOADING_LABEL : ATTACHMENTS_EMPTY_LABEL;
  const downloadFilename = useMemo(() => {
    if (!request?.id) return 'request-attachments.zip';
    const reference = request.requestNumber ?? request.id;
    return `request-${reference}-attachments.zip`;
  }, [request?.id, request?.requestNumber]);

  const { user } = useAuth();
  const { data: messagesData, isLoading: messagesLoading } = useChatMessages(request?.id);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkChatAsRead();
  const lastMarkedRef = useRef<{ requestId: string; unreadCount: number; lastAttemptAt: number } | null>(null);

  useEffect(() => {
    if (!request) return;
    setStatusOverride(request.status);
  }, [request?.status]);

  useEffect(() => {
    if (!copied) return undefined;
    const timeout = window.setTimeout(() => setCopied(false), COPY_RESET_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const isManager = useMemo(
    () => Boolean(user && ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role)),
    [user]
  );

  const unreadMessagesCount = useMemo(() => {
    if (!request?.id) return 0;
    const targetSenders = isManager ? ['CUSTOMER'] : ['MANAGER', 'SYSTEM'];
    return messagesData?.data?.reduce((count, message) => {
      if (!message.isRead && targetSenders.includes(message.senderType)) {
        return count + 1;
      }
      return count;
    }, 0) ?? 0;
  }, [messagesData?.data, isManager, request?.id]);

  const tryMarkAsRead = useCallback(() => {
    if (!request?.id) return;
    if (unreadMessagesCount <= 0) {
      lastMarkedRef.current = {
        requestId: request.id,
        unreadCount: 0,
        lastAttemptAt: Date.now(),
      };
      return;
    }
    if (markAsRead.isPending) return;

    if (typeof document !== 'undefined') {
      const isVisible = document.visibilityState === 'visible';
      const hasFocus = typeof document.hasFocus === 'function' ? document.hasFocus() : true;
      if (!isVisible || !hasFocus) return;
    }

    const now = Date.now();
    const lastAttempt = lastMarkedRef.current;
    if (
      lastAttempt &&
      lastAttempt.requestId === request.id &&
      lastAttempt.unreadCount === unreadMessagesCount &&
      now - lastAttempt.lastAttemptAt < 4000
    ) {
      return;
    }

    lastMarkedRef.current = {
      requestId: request.id,
      unreadCount: unreadMessagesCount,
      lastAttemptAt: now,
    };
    markAsRead.mutate(request.id);
  }, [markAsRead, markAsRead.isPending, request?.id, unreadMessagesCount]);

  useEffect(() => {
    tryMarkAsRead();
  }, [tryMarkAsRead]);

  useEffect(() => {
    if (!request?.id) return;
    const handleVisibility = () => tryMarkAsRead();
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [request?.id, tryMarkAsRead]);

  const handleCopy = useCallback(async () => {
    if (!request) return;
    try {
      await navigator.clipboard.writeText(buildCopyText(request));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [request]);

  const handleStatusChange = useCallback(
    async (value: SupplyRequestStatus | typeof REQUEST_STATUS_FILTER_ALL) => {
      if (!request || value === REQUEST_STATUS_FILTER_ALL) return;
      setStatusOverride(value);
      try {
        const updated = await updateStatus.mutateAsync({ id: request.id, data: { status: value } });
        setStatusOverride(updated.status);
      } catch {
        setStatusOverride(request.status);
      }
    },
    [request, updateStatus]
  );

  const handleDownloadAll = useCallback(async () => {
    if (!request?.id) return;
    const blob = await downloadAttachments.mutateAsync(request.id);
    downloadBlob(blob, downloadFilename);
  }, [downloadAttachments, downloadFilename, request?.id]);

  const handleSend = useCallback(
    (content: string, files: File[]) => {
      if (!request?.id) return;

      sendMessage.mutate({
        data: { requestId: request.id, content },
        files: files.length > 0 ? files : undefined,
      });
    },
    [request?.id, sendMessage]
  );

  const isCurrentUserSender = useCallback(
    (message: ChatMessage): boolean => {
      if (!user) return false;
      const isManager = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role);

      if (isManager) {
        return message.senderType === 'MANAGER' && !!message.senderId && message.senderId === user.id;
      }

      return message.senderType === 'CUSTOMER';
    },
    [user]
  );

  if (isLoading) {
    return <RequestDetailsSkeleton />;
  }

  if (notFound) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{REQUEST_NOT_FOUND_TITLE}</CardTitle>
          <CardDescription>{REQUEST_NOT_FOUND_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/admin/requests">{BACK_LABEL}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{REQUEST_ERROR_TITLE}</CardTitle>
          <CardDescription>{REQUEST_ERROR_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/admin/requests">{BACK_LABEL}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!request) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{REQUEST_NOT_FOUND_TITLE}</CardTitle>
          <CardDescription>{REQUEST_NOT_FOUND_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/admin/requests">{BACK_LABEL}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = request.unreadCount ?? 0;
  const messages = messagesData?.data ?? [];

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-6 overflow-y-auto scrollbar-invisible">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between shrink-0">
        <div className="space-y-3">
          <Button asChild variant="ghost" size="sm" className="w-fit">
            <Link href="/admin/requests">
              <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
              {BACK_LABEL}
            </Link>
          </Button>
          <div className="flex flex-wrap items-end gap-2">
            <h1 className="text-2xl font-bold">{PAGE_TITLE}</h1>
            <span className="text-2xl font-bold text-muted-foreground">
              {formatRequestNumber(request.requestNumber, false)}
            </span>
            {statusValue && (
              <span className="self-center">
                <RequestStatusBadge status={statusValue} />
              </span>
            )}
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} новых</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              <span>Создана {formatDate(request.createdAt)}</span>
            </div>
            {request.updatedAt && (
              <>
                <span aria-hidden="true">|</span>
                <span>Обновлена {formatDate(request.updatedAt)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleCopy}>
            <ClipboardCopy className="mr-2 h-4 w-4" aria-hidden="true" />
            {copied ? COPIED_LABEL : COPY_LABEL}
          </Button>
          <Button
            variant="secondary"
            onClick={handleDownloadAll}
            disabled={attachments.length === 0 || downloadAttachments.isPending}
          >
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            {ATTACHMENTS_DOWNLOAD_ALL_LABEL}
          </Button>
        </div>
      </div>

      <div className="min-w-0 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
        <div className="space-y-6 lg:col-span-2 min-h-0">
          <Card>
            <CardHeader>
              <CardTitle>{META_TITLE}</CardTitle>
              <CardDescription>{META_DESCRIPTION}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground">{CONTACT_LABEL}</div>
                  <RequestContact request={request} variant="card" className="mt-2" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{COMPANY_LABEL}</div>
                  <div className="text-sm">{request.company || EMPTY_COMPANY}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground">{NUMBER_LABEL}</div>
                  <div className="text-sm flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>{formatRequestNumber(request.requestNumber, false)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{DATE_LABEL}</div>
                  <div className="text-sm">{formatDate(request.createdAt)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{STATUS_LABEL}</div>
                  <RequestStatusSelect
                    value={statusValue ?? request.status}
                    onChange={handleStatusChange}
                    className="mt-2 sm:max-w-sm"
                    disabled={updateStatus.isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{REQUEST_MESSAGE_TITLE}</CardTitle>
              <CardDescription>{REQUEST_MESSAGE_LABEL}</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestMessage label={REQUEST_MESSAGE_LABEL} message={request.description} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{ATTACHMENTS_TITLE}</CardTitle>
                <CardDescription>{ATTACHMENTS_DESCRIPTION}</CardDescription>
              </div>
              {attachments.length > 0 && (
                <Badge variant="secondary">{attachments.length}</Badge>
              )}
            </CardHeader>
            <CardContent>
              <RequestAttachments
                attachments={attachments}
                emptyLabel={attachmentsEmptyLabel}
                onDownloadAll={handleDownloadAll}
                isDownloadAllPending={downloadAttachments.isPending}
                downloadAllLabel={ATTACHMENTS_DOWNLOAD_ALL_LABEL}
                openLabel={ATTACHMENTS_OPEN_LABEL}
                downloadLabel={ATTACHMENTS_DOWNLOAD_LABEL}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col min-h-0">
          <Card id="chat" className="admin-request-chat flex flex-col min-h-0 overflow-hidden lg:sticky lg:top-4">
            <CardHeader className="shrink-0">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                {CHAT_TITLE}
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>{CHAT_DESCRIPTION}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col min-h-0 p-0 overflow-hidden">
              <ChatMessagesList
                messages={messages}
                isLoading={messagesLoading}
                isCurrentUserSender={isCurrentUserSender}
              />

              <div className="shrink-0">
                <ChatInput
                  onSend={handleSend}
                  disabled={sendMessage.isPending}
                  placeholder={CHAT_PLACEHOLDER}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RequestDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
