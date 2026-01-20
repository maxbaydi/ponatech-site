'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MoreHorizontal, Trash2, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDeletedProducts,
  useRestoreProduct,
  useRestoreProductsBatch,
  usePermanentDeleteProduct,
  usePermanentDeleteProductsBatch,
} from '@/lib/hooks/use-products';
import { useBrands } from '@/lib/hooks/use-brands';
import { useDebouncedSearchParams } from '@/lib/hooks/use-debounced-search-params';
import { useDisplayCurrency } from '@/lib/hooks/use-site-settings';
import { formatPrice } from '@/lib/utils';
import type { Product, ProductStatus } from '@/lib/api/types';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ProductImagePreview } from './product-image-preview';

const STATUS_BADGES: Record<ProductStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  PUBLISHED: { label: 'Опубликован', variant: 'default' },
  DRAFT: { label: 'Черновик', variant: 'secondary' },
  ARCHIVED: { label: 'В архиве', variant: 'outline' },
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_PAGE = 1;
const SEARCH_DEBOUNCE_MS = 500;
const MAX_VISIBLE_PAGES = 7;
const EMPTY_PRODUCTS: Product[] = [];

const ALL_BRANDS_VALUE = '__ALL_BRANDS__';

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = value ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getPaginationRange = (current: number, total: number): Array<number | 'ellipsis'> => {
  if (total <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const range: Array<number | 'ellipsis'> = [];
  const first = 1;
  const last = total;
  const siblings = 1;

  const left = Math.max(current - siblings, 2);
  const right = Math.min(current + siblings, total - 1);

  range.push(first);
  if (left > 2) range.push('ellipsis');

  for (let p = left; p <= right; p += 1) {
    range.push(p);
  }

  if (right < total - 1) range.push('ellipsis');
  range.push(last);

  return range;
};

export function DeletedProductsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const displayCurrency = useDisplayCurrency();

  const page = parsePositiveInt(searchParams.get('trashPage'), DEFAULT_PAGE);
  const limitRaw = parsePositiveInt(searchParams.get('trashLimit'), DEFAULT_PAGE_SIZE);
  const limit = PAGE_SIZE_OPTIONS.includes(limitRaw as (typeof PAGE_SIZE_OPTIONS)[number])
    ? (limitRaw as (typeof PAGE_SIZE_OPTIONS)[number])
    : DEFAULT_PAGE_SIZE;

  const { searchInput, setSearchInput, searchQuery, buildUrlWithParams } = useDebouncedSearchParams({
    basePath: '/admin/manage-products',
    searchKey: 'trashSearch',
    pageKey: 'trashPage',
    defaultPage: DEFAULT_PAGE,
    delayMs: SEARCH_DEBOUNCE_MS,
  });

  const brandIdFilterValue = searchParams.get('trashBrandId') ?? ALL_BRANDS_VALUE;

  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      page,
      limit,
      brandId: brandIdFilterValue === ALL_BRANDS_VALUE ? undefined : brandIdFilterValue,
    }),
    [searchQuery, page, limit, brandIdFilterValue]
  );

  const { data: productsPage, isLoading } = useDeletedProducts(filters);
  const products = productsPage?.data ?? EMPTY_PRODUCTS;
  const totalPages = productsPage?.totalPages ?? 0;
  const { data: brands } = useBrands();

  const restoreProduct = useRestoreProduct();
  const restoreProductsBatch = useRestoreProductsBatch();
  const permanentDeleteProduct = usePermanentDeleteProduct();
  const permanentDeleteProductsBatch = usePermanentDeleteProductsBatch();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const selectedCount = selectedIds.size;

  const [confirmPermanentDeleteOpen, setConfirmPermanentDeleteOpen] = useState(false);
  const [confirmPermanentDeleteIds, setConfirmPermanentDeleteIds] = useState<string[]>([]);

  useEffect(() => {
    if (!products || products.length === 0) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds((prev) => {
      const available = new Set(products.map((p) => p.id));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (available.has(id)) next.add(id);
      });
      return next;
    });
  }, [products]);

  const handleRestore = async (id: string) => {
    await restoreProduct.mutateAsync(id);
  };

  const handlePermanentDelete = async (id: string) => {
    setConfirmPermanentDeleteIds([id]);
    setConfirmPermanentDeleteOpen(true);
  };

  const confirmPermanentDelete = async () => {
    if (confirmPermanentDeleteIds.length === 1) {
      await permanentDeleteProduct.mutateAsync(confirmPermanentDeleteIds[0]);
    } else {
      await permanentDeleteProductsBatch.mutateAsync(confirmPermanentDeleteIds);
    }
    setConfirmPermanentDeleteOpen(false);
    setConfirmPermanentDeleteIds([]);
    clearSelection();
  };

  const allVisibleSelected = !!products && products.length > 0 && products.every((p) => selectedIds.has(p.id));
  const someVisibleSelected = !!products && products.some((p) => selectedIds.has(p.id));

  const toggleSelectAllVisible = () => {
    if (!products || products.length === 0) return;

    setSelectedIds((prev) => {
      if (products.every((p) => prev.has(p.id))) {
        const next = new Set(prev);
        products.forEach((p) => next.delete(p.id));
        return next;
      }

      const next = new Set(prev);
      products.forEach((p) => next.add(p.id));
      return next;
    });
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const runBatchRestore = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await restoreProductsBatch.mutateAsync(ids);
    clearSelection();
  };

  const runBatchPermanentDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setConfirmPermanentDeleteIds(ids);
    setConfirmPermanentDeleteOpen(true);
  };

  const formatDeletedDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск в корзине..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Select
                value={brandIdFilterValue}
                onValueChange={(v) =>
                  router.replace(buildUrlWithParams({ trashBrandId: v === ALL_BRANDS_VALUE ? undefined : v, trashPage: DEFAULT_PAGE }))
                }
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Бренд" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_BRANDS_VALUE}>Все бренды</SelectItem>
                  {brands?.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="text-sm text-muted-foreground">Выбрано: {selectedCount}</div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Действия
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={runBatchRestore}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Восстановить
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={runBatchPermanentDelete} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Удалить навсегда
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={clearSelection}>Сбросить выделение</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[48px]">
                    <Checkbox
                      checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                      onCheckedChange={toggleSelectAllVisible}
                      aria-label="Выбрать все товары на странице"
                    />
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Товар</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Бренд</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Удалён</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const statusBadge = STATUS_BADGES[product.status];
                  return (
                    <TableRow key={product.id} className="opacity-60 hover:opacity-100 transition-opacity">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(product.id)}
                          onCheckedChange={() => toggleSelected(product.id)}
                          aria-label={`Выбрать товар ${product.title}`}
                        />
                      </TableCell>
                      <TableCell>
                        <ProductImagePreview images={product.images} title={product.title} />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.title}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell>{product.brand?.name || '-'}</TableCell>
                      <TableCell>{formatPrice(product.price, displayCurrency)}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDeletedDate(product.deletedAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRestore(product.id)}>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Восстановить
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handlePermanentDelete(product.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Удалить навсегда
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>Корзина пуста</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">На странице</div>
          <Select
            value={String(limit)}
            onValueChange={(v) => {
              const nextLimit = Number.parseInt(v, 10);
              router.replace(buildUrlWithParams({ trashLimit: nextLimit, trashPage: DEFAULT_PAGE }));
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">Всего: {productsPage?.total ?? 0}</div>
        </div>

        {totalPages > 1 && (
          <Pagination className="sm:justify-end">
            <PaginationContent className="flex-wrap justify-center sm:justify-end">
              <PaginationItem>
                <PaginationPrevious
                  href={buildUrlWithParams({ trashPage: Math.max(DEFAULT_PAGE, page - 1) })}
                  aria-disabled={page <= DEFAULT_PAGE}
                  className={page <= DEFAULT_PAGE ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>

              {getPaginationRange(page, totalPages).map((item, idx) => {
                if (item === 'ellipsis') {
                  return (
                    <PaginationItem key={`e-${idx}`}>
                      <span className="flex h-9 w-9 items-center justify-center text-muted-foreground">…</span>
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={item}>
                    <PaginationLink href={buildUrlWithParams({ trashPage: item })} isActive={item === page}>
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href={buildUrlWithParams({ trashPage: Math.min(totalPages, page + 1) })}
                  aria-disabled={page >= totalPages}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <Dialog open={confirmPermanentDeleteOpen} onOpenChange={setConfirmPermanentDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить навсегда?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {confirmPermanentDeleteIds.length === 1
                ? 'Этот товар будет удалён безвозвратно. Это действие нельзя отменить.'
                : `Выбранные товары (${confirmPermanentDeleteIds.length}) будут удалены безвозвратно. Это действие нельзя отменить.`}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmPermanentDeleteOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={confirmPermanentDelete}
              disabled={permanentDeleteProduct.isPending || permanentDeleteProductsBatch.isPending}
            >
              Удалить навсегда
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
