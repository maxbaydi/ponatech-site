'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
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
import { RequestsHistorySheet } from './requests-history-sheet';

const EMPTY_TEXT = 'У вас пока нет заявок';
const ERROR_TEXT = 'Не удалось загрузить заявки';
const DETAILS_LABEL = 'Подробнее';
const NUMBER_LABEL = '№';
const DATE_LABEL = 'Дата';
const STATUS_LABEL = 'Статус';
const ACTIONS_LABEL = '';
const PAGE_LABEL = 'Страница';
const TOTAL_LABEL = 'Всего';
const PREV_LABEL = 'Назад';
const NEXT_LABEL = 'Вперёд';
const SEARCH_PLACEHOLDER = 'Поиск по номеру заявки...';

const DEFAULT_PAGE = 1;
const PAGE_SIZE = 5;
const SKELETON_ROWS = 4;
const SEARCH_DEBOUNCE_MS = 400;
const EMPTY_REQUESTS: SupplyRequest[] = [];

export function RequestsHistory() {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [selectedRequest, setSelectedRequest] = useState<SupplyRequest | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(DEFAULT_PAGE);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput]);

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

  const handleOpen = (request: SupplyRequest) => setSelectedRequest(request);
  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedRequest(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={SEARCH_PLACEHOLDER}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="pl-10"
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
            {requests.map((request) => (
              <div key={request.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{formatRequestNumber(request.requestNumber, false)}</span>
                  <RequestStatusBadge status={request.status} />
                </div>
                <div className="text-xs text-muted-foreground">{formatDate(request.createdAt)}</div>
                <Button variant="outline" size="sm" onClick={() => handleOpen(request)}>
                  {DETAILS_LABEL}
                </Button>
              </div>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">{NUMBER_LABEL}</TableHead>
                  <TableHead className="w-[160px]">{DATE_LABEL}</TableHead>
                  <TableHead className="w-[160px]">{STATUS_LABEL}</TableHead>
                  <TableHead className="w-[120px]">{ACTIONS_LABEL}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
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
                      <Button variant="outline" size="sm" onClick={() => handleOpen(request)}>
                        {DETAILS_LABEL}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
    </div>
  );
}
