'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { useSupplyRequests } from '@/lib/hooks/use-supply-requests';
import { formatDate, truncate } from '@/lib/utils';
import type { SupplyRequest } from '@/lib/api/types';
import { EMPTY_COMPANY } from './request-constants';
import { RequestCard } from './request-card';
import { RequestContact } from './request-contact';
import { formatRequestNumber } from '@/lib/requests/request-number';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { RequestStatusSelect } from './request-status-select';
import { REQUEST_STATUS_FILTER_ALL, type RequestStatusFilter } from '@/lib/requests/request-status';

const TITLE = 'Заявки';
const DESCRIPTION = 'Запросы на поставку от клиентов';
const SEARCH_PLACEHOLDER = 'Поиск по номеру, имени, email или названию компании, 0001_27012026';
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
const CHAT_LABEL = 'Чат';

const buildRequestDetailsHref = (request: SupplyRequest): string => {
  return request.requestNumber
    ? `/admin/requests/${encodeURIComponent(request.requestNumber)}`
    : '/admin/requests';
};

const DEFAULT_PAGE = 1;
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;
const DESCRIPTION_PREVIEW_LENGTH = 100;
const SKELETON_ROWS = 5;
const EMPTY_REQUESTS: SupplyRequest[] = [];

export default function RequestsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [statusFilter, setStatusFilter] = useState<RequestStatusFilter>(REQUEST_STATUS_FILTER_ALL);

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

  const handleStatusFilterChange = useCallback((value: RequestStatusFilter) => {
    setStatusFilter(value);
    setPage(DEFAULT_PAGE);
  }, []);


  const handleOpenChat = useCallback((request: SupplyRequest) => {
    router.push(`/admin/chats?request=${request.id}`);
  }, [router]);



  const requests = data?.data ?? EMPTY_REQUESTS;
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;
  const canGoPrev = page > DEFAULT_PAGE;
  const canGoNext = page < totalPages;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{TITLE}</h1>
        <p className="text-muted-foreground">{DESCRIPTION}</p>
      </div>

      <Card className="border-0 shadow-none">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                placeholder={SEARCH_PLACEHOLDER}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="pl-10"
                aria-label={SEARCH_PLACEHOLDER}
                name="search"
                autoComplete="off"
                inputMode="search"
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
                    detailsHref={buildRequestDetailsHref(request)}
                    detailsDisabled={!request.requestNumber}
                    onOpenChat={handleOpenChat}
                    descriptionPreviewLength={DESCRIPTION_PREVIEW_LENGTH}
                    detailsLabel={DETAILS_LABEL}
                    chatLabel={CHAT_LABEL}
                  />
                ))}
              </div>
              <div className="hidden md:block overflow-x-auto">
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px] min-w-[80px] sm:w-[120px]">{NUMBER_LABEL}</TableHead>
                      <TableHead className="w-[110px] min-w-[90px] sm:w-[140px]">{DATE_LABEL}</TableHead>
                      <TableHead className="w-[200px] min-w-[160px] max-w-[250px] lg:w-[250px]">{CONTACT_LABEL}</TableHead>
                      <TableHead className="w-[100px] min-w-[80px] sm:w-[140px]">{STATUS_LABEL}</TableHead>
                      <TableHead className="hidden xl:table-cell w-[200px] min-w-[180px] 2xl:w-[250px]">{COMPANY_LABEL}</TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[180px] w-auto">{REQUEST_LABEL}</TableHead>
                      <TableHead className="w-[190px] min-w-[160px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => {
                      const unreadCount = request.unreadCount ?? 0;
                      const detailsHref = buildRequestDetailsHref(request);
                      const detailsDisabled = !request.requestNumber;
                      const requestNumberLabel = formatRequestNumber(request.requestNumber, false);
                      return (
                        <TableRow key={request.id}>
                        <TableCell className="text-sm font-medium w-[100px] min-w-[80px] sm:w-[120px]">
                          {detailsDisabled ? (
                            <span>{requestNumberLabel}</span>
                          ) : (
                            <Link
                              href={detailsHref}
                              className="underline decoration-dotted underline-offset-4 transition-colors hover:text-foreground"
                            >
                              {requestNumberLabel}
                            </Link>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground w-[110px] min-w-[90px] sm:w-[140px]">
                          {formatDate(request.createdAt)}
                        </TableCell>
                        <TableCell className="w-[200px] min-w-[160px] max-w-[250px] lg:w-[250px]">
                          <RequestContact request={request} />
                        </TableCell>
                        <TableCell className="w-[100px] min-w-[80px] sm:w-[140px]">
                          <RequestStatusBadge status={request.status} />
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm w-[200px] min-w-[180px] 2xl:w-[250px]">
                          {request.company || EMPTY_COMPANY}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground min-w-0 align-top py-1.5">
                          <div className="max-h-[4rem] overflow-hidden">
                            <span className="line-clamp-3 block min-w-0 break-words">
                              {truncate(request.description, DESCRIPTION_PREVIEW_LENGTH)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[190px] min-w-[160px] align-middle py-1.5 h-20">
                          <div className="flex flex-col sm:flex-row flex-wrap justify-center text-center gap-1.5 items-center w-full max-w-[175px] min-w-0 min-h-10 p-0.5 m-0.5">
                            {detailsDisabled ? (
                              <Button variant="outline" size="sm" className="shrink-0" disabled>
                                {DETAILS_LABEL}
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" className="shrink-0" asChild>
                                <Link href={detailsHref}>{DETAILS_LABEL}</Link>
                              </Button>
                            )}
                            <div className="relative inline-block shrink-0">
                              {unreadCount > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="absolute -top-1.5 -right-1 min-w-5 h-5 px-1 z-10"
                                >
                                  {unreadCount}
                                </Badge>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenChat(request)}
                                className="shrink-0"
                                aria-label={CHAT_LABEL}
                              >
                                <MessageCircle className="h-4 w-4 lg:mr-1" aria-hidden="true" />
                                <span className="hidden lg:inline">{CHAT_LABEL}</span>
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
    </div>
  );
}
