'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SupplyRequest } from '@/lib/api/types';
import { useMySupplyRequests } from '@/lib/hooks/use-supply-requests';
import { formatDate } from '@/lib/utils';
import { formatRequestNumber } from '@/lib/requests/request-number';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import {
  getProfileNotificationView,
  PROFILE_REQUEST_NUMBER_PARAM,
  PROFILE_REQUEST_PARAM,
  PROFILE_VIEW_CHAT,
  PROFILE_VIEW_DETAILS,
  PROFILE_VIEW_PARAM,
} from '@/lib/requests/profile-navigation';
import { RequestsHistorySheet } from './requests-history-sheet';
import { RequestChat } from '@/components/chat';

const EMPTY_TEXT = 'У вас пока нет заявок';
const ERROR_TEXT = 'Не удалось загрузить заявки';
const DETAILS_LABEL = 'Подробнее';
const CHAT_LABEL = 'Чат';
const NUMBER_LABEL = '№';
const DATE_LABEL = 'Дата';
const STATUS_LABEL = 'Статус';
const ACTIONS_LABEL = '';
const PAGE_LABEL = 'Страница';
const TOTAL_LABEL = 'Всего';
const PREV_LABEL = 'Назад';
const NEXT_LABEL = 'Вперёд';
const SEARCH_PLACEHOLDER = 'Поиск по номеру заявки… например, 0001_27012026';
const TABLE_ARIA_LABEL = 'История заявок';
const SEARCH_ARIA_LABEL = 'Поиск по номеру заявки';

const DEFAULT_PAGE = 1;
const PAGE_SIZE = 4;
const SKELETON_ROWS = 4;
const SEARCH_DEBOUNCE_MS = 400;
const EMPTY_REQUESTS: SupplyRequest[] = [];

export function RequestsHistory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [selectedRequest, setSelectedRequest] = useState<SupplyRequest | null>(null);
  const [chatRequest, setChatRequest] = useState<SupplyRequest | null>(null);
  const lastRequestedRef = useRef<string | null>(null);
  const lastOpenedRef = useRef<string | null>(null);

  const requestIdParam = searchParams.get(PROFILE_REQUEST_PARAM);
  const requestNumberParam = searchParams.get(PROFILE_REQUEST_NUMBER_PARAM);
  const viewParam = getProfileNotificationView(searchParams.get(PROFILE_VIEW_PARAM));

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(DEFAULT_PAGE);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (!requestNumberParam) return;
    if (lastRequestedRef.current === requestNumberParam) return;
    lastRequestedRef.current = requestNumberParam;
    setSearchInput(requestNumberParam);
    setSearchQuery(requestNumberParam);
    setPage(DEFAULT_PAGE);
  }, [requestNumberParam]);

  useEffect(() => {
    if (!requestIdParam || requestNumberParam) return;
    if (!searchInput && !searchQuery && page === DEFAULT_PAGE) return;
    lastRequestedRef.current = null;
    setSearchInput('');
    setSearchQuery('');
    setPage(DEFAULT_PAGE);
  }, [page, requestIdParam, requestNumberParam, searchInput, searchQuery]);

  const filters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: searchQuery || undefined,
    }),
    [page, searchQuery]
  );

  const { data, isLoading, error } = useMySupplyRequests(filters);
  const requests = data?.data ?? EMPTY_REQUESTS;
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;
  const canGoPrev = page > DEFAULT_PAGE;
  const canGoNext = page < totalPages;

  useEffect(() => {
    if (!viewParam) return;
    const targetKey = requestIdParam ?? requestNumberParam;
    if (!targetKey) return;
    const key = `${viewParam}:${targetKey}`;
    if (lastOpenedRef.current === key) return;

    const targetRequest = requests.find((request) => {
      if (requestIdParam) {
        return request.id === requestIdParam;
      }
      return request.requestNumber === requestNumberParam;
    });

    if (!targetRequest) return;

    lastOpenedRef.current = key;

    if (viewParam === PROFILE_VIEW_CHAT) {
      setSelectedRequest(null);
      setChatRequest(targetRequest);
    } else if (viewParam === PROFILE_VIEW_DETAILS) {
      setChatRequest(null);
      setSelectedRequest(targetRequest);
    }
  }, [requests, requestIdParam, requestNumberParam, viewParam]);

  const clearNotificationParams = useCallback(() => {
    if (
      !searchParams.has(PROFILE_VIEW_PARAM) &&
      !searchParams.has(PROFILE_REQUEST_PARAM) &&
      !searchParams.has(PROFILE_REQUEST_NUMBER_PARAM)
    ) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete(PROFILE_VIEW_PARAM);
    params.delete(PROFILE_REQUEST_PARAM);
    params.delete(PROFILE_REQUEST_NUMBER_PARAM);
    const query = params.toString();
    lastOpenedRef.current = null;
    lastRequestedRef.current = null;
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router, searchParams]);

  const handleOpen = (request: SupplyRequest) => setSelectedRequest(request);
  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedRequest(null);
      clearNotificationParams();
    }
  };
  const handleOpenChat = (request: SupplyRequest) => setChatRequest(request);
  const handleChatOpenChange = (open: boolean) => {
    if (!open) {
      setChatRequest(null);
      clearNotificationParams();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          placeholder={SEARCH_PLACEHOLDER}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="pl-10"
          aria-label={SEARCH_ARIA_LABEL}
          name="search"
          autoComplete="off"
          inputMode="search"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">
          <p>{ERROR_TEXT}</p>
        </div>
      ) : requests.length > 0 ? (
        <>
          <div className="space-y-3 md:hidden">
            {requests.map((request) => {
              const unreadCount = request.unreadCount ?? 0;
              return (
                <div key={request.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{formatRequestNumber(request.requestNumber, false)}</span>
                    <RequestStatusBadge status={request.status} />
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDate(request.createdAt)}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpen(request)}>
                      {DETAILS_LABEL}
                    </Button>
                    <div className="relative inline-block">
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1.5 -right-1 min-w-5 h-5 px-1 z-10"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleOpenChat(request)}>
                        <MessageCircle className="mr-1 h-4 w-4" aria-hidden="true" />
                        <span>{CHAT_LABEL}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table aria-label={TABLE_ARIA_LABEL}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">{NUMBER_LABEL}</TableHead>
                  <TableHead className="w-[160px]">{DATE_LABEL}</TableHead>
                  <TableHead className="w-[160px]">{STATUS_LABEL}</TableHead>
                  <TableHead className="w-[120px]">{ACTIONS_LABEL}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const unreadCount = request.unreadCount ?? 0;
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="text-sm font-medium">
                        {formatRequestNumber(request.requestNumber, false)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(request.createdAt)}
                      </TableCell>
                      <TableCell>
                        <RequestStatusBadge status={request.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpen(request)}>
                            {DETAILS_LABEL}
                          </Button>
                          <div className="relative inline-block">
                            {unreadCount > 0 && (
                              <Badge
                                variant="destructive"
                                className="absolute -top-1.5 -right-1 min-w-5 h-5 px-1 z-10"
                              >
                                {unreadCount}
                              </Badge>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleOpenChat(request)}>
                              <MessageCircle className="mr-1 h-4 w-4" aria-hidden="true" />
                              <span>{CHAT_LABEL}</span>
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {PAGE_LABEL} {page} из {totalPages} ({TOTAL_LABEL.toLowerCase()} {total})
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(DEFAULT_PAGE, prev - 1))}
                  disabled={!canGoPrev}
                >
                  {PREV_LABEL}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={!canGoNext}
                >
                  {NEXT_LABEL}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>{EMPTY_TEXT}</p>
        </div>
      )}

      <RequestsHistorySheet
        request={selectedRequest}
        open={selectedRequest !== null}
        onOpenChange={handleSheetOpenChange}
      />

      <RequestChat
        request={chatRequest}
        open={chatRequest !== null}
        onOpenChange={handleChatOpenChange}
      />
    </div>
  );
}
