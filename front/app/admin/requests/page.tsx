'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { useSupplyRequests, useUpdateSupplyRequestStatus } from '@/lib/hooks/use-supply-requests';
import { formatDate, truncate } from '@/lib/utils';
import type { SupplyRequest, SupplyRequestStatus } from '@/lib/api/types';
import { EMPTY_COMPANY } from './request-constants';
import { RequestCard } from './request-card';
import { RequestContact } from './request-contact';
import { RequestDetailSheet } from './request-detail-sheet';
import { formatRequestNumber } from '@/lib/requests/request-number';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { RequestStatusSelect } from './request-status-select';
import { REQUEST_STATUS_FILTER_ALL, type RequestStatusFilter } from '@/lib/requests/request-status';

const TITLE = 'Заявки';
const DESCRIPTION = 'Запросы на поставку от клиентов';
const SEARCH_PLACEHOLDER = 'Поиск по номеру, имени, email или телефону...';
const STATUS_FILTER_PLACEHOLDER = 'Статус';
const EMPTY_TEXT = 'Заявки не найдены';
const ERROR_TEXT = 'Ошибка загрузки заявок';
const TOTAL_LABEL = 'Всего';
const PAGE_LABEL = 'Страница';
const PREV_LABEL = 'Назад';
const NEXT_LABEL = 'Вперёд';
const DATE_LABEL = 'Дата';
const NUMBER_LABEL = '№';
const CONTACT_LABEL = 'Контакт';
const STATUS_LABEL = 'Статус';
const COMPANY_LABEL = 'Компания';
const REQUEST_LABEL = 'Запрос';
const DETAILS_LABEL = 'Подробнее';

const DEFAULT_PAGE = 1;
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;
const DESCRIPTION_PREVIEW_LENGTH = 100;
const SKELETON_ROWS = 5;
const EMPTY_REQUESTS: SupplyRequest[] = [];

export default function RequestsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [statusFilter, setStatusFilter] = useState<RequestStatusFilter>(REQUEST_STATUS_FILTER_ALL);
  const [selectedRequest, setSelectedRequest] = useState<SupplyRequest | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(DEFAULT_PAGE);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const statusValue = statusFilter === REQUEST_STATUS_FILTER_ALL ? undefined : statusFilter;
  const filters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: searchQuery || undefined,
      status: statusValue,
    }),
    [page, searchQuery, statusValue]
  );

  const { data, isLoading, error } = useSupplyRequests(filters);
  const updateStatus = useUpdateSupplyRequestStatus();

  const handleStatusFilterChange = useCallback((value: RequestStatusFilter) => {
    setStatusFilter(value);
    setPage(DEFAULT_PAGE);
  }, []);

  const handleOpenRequest = useCallback((request: SupplyRequest) => {
    setSelectedRequest(request);
  }, []);

  const handleSheetOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSelectedRequest(null);
    }
  }, []);

  const handleStatusChange = useCallback(
    async (id: string, status: SupplyRequestStatus) => {
      try {
        const updated = await updateStatus.mutateAsync({ id, data: { status } });
        setSelectedRequest((prev) => (prev?.id === updated.id ? updated : prev));
      } catch {
        return;
      }
    },
    [updateStatus]
  );

  const requests = data?.data ?? EMPTY_REQUESTS;
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;
  const canGoPrev = page > DEFAULT_PAGE;
  const canGoNext = page < totalPages;
  const sheetOpen = selectedRequest !== null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{TITLE}</h1>
        <p className="text-muted-foreground">{DESCRIPTION}</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={SEARCH_PLACEHOLDER}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full lg:max-w-[220px]">
              <RequestStatusSelect
                value={statusFilter}
                onChange={handleStatusFilterChange}
                includeAllOption
                placeholder={STATUS_FILTER_PLACEHOLDER}
              />
            </div>
            <div className="text-sm text-muted-foreground lg:ml-auto">
              {TOTAL_LABEL}: {total}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">
              <p>{ERROR_TEXT}</p>
            </div>
          ) : requests.length > 0 ? (
            <>
              <div className="space-y-4 p-4 md:hidden">
                {requests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onOpen={handleOpenRequest}
                    descriptionPreviewLength={DESCRIPTION_PREVIEW_LENGTH}
                    detailsLabel={DETAILS_LABEL}
                  />
                ))}
              </div>
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">{NUMBER_LABEL}</TableHead>
                      <TableHead className="w-[140px]">{DATE_LABEL}</TableHead>
                      <TableHead className="w-[250px] max-w-[250px]">{CONTACT_LABEL}</TableHead>
                      <TableHead className="w-[140px]">{STATUS_LABEL}</TableHead>
                      <TableHead className="hidden xl:table-cell w-[250px]">{COMPANY_LABEL}</TableHead>
                      <TableHead className="hidden lg:table-cell">{REQUEST_LABEL}</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
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
                        <TableCell className="w-[250px] max-w-[250px]">
                          <RequestContact request={request} />
                        </TableCell>
                        <TableCell>
                          <RequestStatusBadge status={request.status} />
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm w-[250px]">
                          {request.company || EMPTY_COMPANY}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-h-[80px] overflow-hidden">
                          {truncate(request.description, DESCRIPTION_PREVIEW_LENGTH)}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleOpenRequest(request)}>
                            {DETAILS_LABEL}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>{EMPTY_TEXT}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t">
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

      <RequestDetailSheet
        request={selectedRequest}
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        onStatusChange={handleStatusChange}
        isUpdating={updateStatus.isPending}
      />
    </div>
  );
}
