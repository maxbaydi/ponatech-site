'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, ChevronDown, ArchiveRestore } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useProducts,
  useDeleteProduct,
  useDeleteProductsBatch,
  useDeletedProducts,
  useUpdateProductsBrandBatch,
  useUpdateProductsCategoryBatch,
  useUpdateProductsStatusBatch,
} from '@/lib/hooks/use-products';
import { useBrands } from '@/lib/hooks/use-brands';
import { useCategories } from '@/lib/hooks/use-categories';
import { useDebouncedSearchParams } from '@/lib/hooks/use-debounced-search-params';
import { useDisplayCurrency } from '@/lib/hooks/use-site-settings';
import { formatPrice } from '@/lib/utils';
import type { Product, ProductStatus, Category } from '@/lib/api/types';

type CategoryOption = { id: string; label: string; productsCount?: number };

function flattenCategoriesForSelect(categories: Category[], prefix = ''): CategoryOption[] {
  const result: CategoryOption[] = [];
  for (const cat of categories) {
    const label = prefix ? `${prefix} → ${cat.name}` : cat.name;
    result.push({ id: cat.id, label, productsCount: cat.productsCount });
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenCategoriesForSelect(cat.children, label));
    }
  }
  return result;
}
const formatOptionLabel = (label: string, count?: number) => (
  count && count > 0 ? `${label} (${count})` : label
);
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ImportProductsDialog, ExportProductsDialog, DeletedProductsTable, ProductImagePreview } from './components';

const STATUS_BADGES = {
  PUBLISHED: { label: 'Опубликован', variant: 'default' as const },
  DRAFT: { label: 'Черновик', variant: 'secondary' as const },
  ARCHIVED: { label: 'В архиве', variant: 'outline' as const },
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_PAGE = 1;
const SEARCH_DEBOUNCE_MS = 500;
const MAX_VISIBLE_PAGES = 7;
const EMPTY_PRODUCTS: Product[] = [];

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

const ALL_BRANDS_VALUE = '__ALL_BRANDS__';
const ALL_CATEGORIES_VALUE = '__ALL_CATEGORIES__';
const NO_CATEGORY_VALUE = '__NO_CATEGORY__';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const displayCurrency = useDisplayCurrency();

  const page = parsePositiveInt(searchParams.get('page'), DEFAULT_PAGE);
  const limitRaw = parsePositiveInt(searchParams.get('limit'), DEFAULT_PAGE_SIZE);
  const limit = PAGE_SIZE_OPTIONS.includes(limitRaw as (typeof PAGE_SIZE_OPTIONS)[number])
    ? (limitRaw as (typeof PAGE_SIZE_OPTIONS)[number])
    : DEFAULT_PAGE_SIZE;

  const { searchInput, setSearchInput, searchQuery, buildUrlWithParams } = useDebouncedSearchParams({
    basePath: '/admin/manage-products',
    searchKey: 'search',
    pageKey: 'page',
    defaultPage: DEFAULT_PAGE,
    delayMs: SEARCH_DEBOUNCE_MS,
  });

  const brandIdFilterValue = searchParams.get('brandId') ?? ALL_BRANDS_VALUE;
  const categoryIdFilterValue = searchParams.get('categoryId') ?? ALL_CATEGORIES_VALUE;

  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      page,
      limit,
      brandId: brandIdFilterValue === ALL_BRANDS_VALUE ? undefined : brandIdFilterValue,
      categoryId: categoryIdFilterValue === ALL_CATEGORIES_VALUE ? undefined : categoryIdFilterValue,
    }),
    [searchQuery, page, limit, brandIdFilterValue, categoryIdFilterValue]
  );

  const { data: productsPage, isLoading } = useProducts(filters);
  const products = productsPage?.data ?? EMPTY_PRODUCTS;
  const totalPages = productsPage?.totalPages ?? 0;
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();
  const flatCategories = useMemo(() => {
    if (!categories) return [];
    return flattenCategoriesForSelect(categories);
  }, [categories]);
  const deleteProduct = useDeleteProduct();
  const deleteProductsBatch = useDeleteProductsBatch();
  const updateProductsStatusBatch = useUpdateProductsStatusBatch();
  const updateProductsBrandBatch = useUpdateProductsBrandBatch();
  const updateProductsCategoryBatch = useUpdateProductsCategoryBatch();

  const { data: deletedProductsPage } = useDeletedProducts({ limit: 1 });
  const deletedCount = deletedProductsPage?.total ?? 0;
  const activeTab = searchParams.get('view') === 'trash' ? 'trash' : 'all';

  const handleTabChange = (value: string) => {
    router.replace(buildUrlWithParams({ view: value === 'trash' ? 'trash' : undefined }));
  };

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const selectedCount = selectedIds.size;
  const selectedIdsArray = Array.from(selectedIds);

  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<ProductStatus>('PUBLISHED');

  const [bulkBrandOpen, setBulkBrandOpen] = useState(false);
  const [bulkBrandId, setBulkBrandId] = useState<string>('');

  const [bulkCategoryOpen, setBulkCategoryOpen] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState<string>(NO_CATEGORY_VALUE);

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

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      await deleteProduct.mutateAsync(id);
      setSelectedIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
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

  const runBatchDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Удалить выбранные товары (${ids.length})?`)) return;
    await deleteProductsBatch.mutateAsync(ids);
    clearSelection();
  };

  const openBatchBrand = () => {
    setBulkBrandId((prev) => prev || brands?.[0]?.id || '');
    setBulkBrandOpen(true);
  };

  const openBatchCategory = () => {
    setBulkCategoryId((prev) => prev || NO_CATEGORY_VALUE);
    setBulkCategoryOpen(true);
  };

  const runBatchStatus = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await updateProductsStatusBatch.mutateAsync({ ids, status: bulkStatus });
    setBulkStatusOpen(false);
    clearSelection();
  };

  const runBatchBrand = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!bulkBrandId) {
      alert('Выберите бренд');
      return;
    }
    await updateProductsBrandBatch.mutateAsync({ ids, brandId: bulkBrandId });
    setBulkBrandOpen(false);
    clearSelection();
  };

  const runBatchCategory = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const categoryId = bulkCategoryId === NO_CATEGORY_VALUE ? null : bulkCategoryId;
    await updateProductsCategoryBatch.mutateAsync({ ids, categoryId });
    setBulkCategoryOpen(false);
    clearSelection();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Товары</h1>
          <p className="text-muted-foreground">Управление каталогом товаров</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ImportProductsDialog />
          <ExportProductsDialog searchQuery={searchQuery} selectedIds={selectedIdsArray} />
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/manage-products/new">
              <Plus className="mr-2 h-4 w-4" />
              Добавить товар
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="all">
            Все товары
            {productsPage?.total !== undefined && (
              <span className="ml-2 text-xs text-muted-foreground">({productsPage.total})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="trash" className="gap-2">
            <ArchiveRestore className="h-4 w-4" />
            Корзина
            {deletedCount > 0 && (
              <span className="ml-1 text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">
                {deletedCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск товаров..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Select
                value={brandIdFilterValue}
                onValueChange={(v) => router.replace(buildUrlWithParams({ brandId: v === ALL_BRANDS_VALUE ? undefined : v, page: DEFAULT_PAGE }))}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Бренд" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_BRANDS_VALUE}>Все бренды</SelectItem>
                  {brands?.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {formatOptionLabel(brand.name, brand.productsCount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={categoryIdFilterValue}
                onValueChange={(v) =>
                  router.replace(buildUrlWithParams({ categoryId: v === ALL_CATEGORIES_VALUE ? undefined : v, page: DEFAULT_PAGE }))
                }
              >
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORIES_VALUE}>Все категории</SelectItem>
                  {flatCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {formatOptionLabel(category.label, category.productsCount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="text-sm text-muted-foreground">Выбрано: {selectedCount}</div>

                <Dialog open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Сменить статус</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Новый статус</div>
                      <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as ProductStatus)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PUBLISHED">Опубликован</SelectItem>
                          <SelectItem value="DRAFT">Черновик</SelectItem>
                          <SelectItem value="ARCHIVED">В архиве</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBulkStatusOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={runBatchStatus} disabled={updateProductsStatusBatch.isPending}>
                        Применить
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={bulkBrandOpen} onOpenChange={setBulkBrandOpen}>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Сменить бренд</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Новый бренд</div>
                      <Select value={bulkBrandId} onValueChange={setBulkBrandId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите бренд" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands?.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {formatOptionLabel(brand.name, brand.productsCount)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBulkBrandOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={runBatchBrand} disabled={updateProductsBrandBatch.isPending}>
                        Применить
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={bulkCategoryOpen} onOpenChange={setBulkCategoryOpen}>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Сменить категорию</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Новая категория</div>
                      <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_CATEGORY_VALUE}>Без категории</SelectItem>
                          {flatCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {formatOptionLabel(category.label, category.productsCount)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBulkCategoryOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={runBatchCategory} disabled={updateProductsCategoryBatch.isPending}>
                        Применить
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Действия
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setBulkStatusOpen(true)}>
                      Сменить статус
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={openBatchBrand} disabled={!brands || brands.length === 0}>
                      Сменить бренд
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={openBatchCategory}>
                      Сменить категорию
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={runBatchDelete} className="text-destructive">
                      Удалить
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
            <div className="overflow-x-auto">
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
                    <TableHead className="w-12 hidden sm:table-cell"></TableHead>
                    <TableHead>Товар</TableHead>
                    <TableHead className="hidden md:table-cell">SKU</TableHead>
                    <TableHead className="hidden lg:table-cell">Бренд</TableHead>
                    <TableHead className="hidden sm:table-cell">Цена</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const statusBadge = STATUS_BADGES[product.status];
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(product.id)}
                            onCheckedChange={() => toggleSelected(product.id)}
                            aria-label={`Выбрать товар ${product.title}`}
                          />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <ProductImagePreview images={product.images} title={product.title} />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium min-w-[150px]">{product.title}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden md:table-cell">{product.sku}</TableCell>
                        <TableCell className="hidden lg:table-cell">{product.brand?.name || '-'}</TableCell>
                        <TableCell className="hidden sm:table-cell">{formatPrice(product.price, displayCurrency)}</TableCell>
                        <TableCell>
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/catalog/${product.slug}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Просмотр
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/manage-products/${product.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Редактировать
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(product.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>Товары не найдены</p>
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
              router.replace(buildUrlWithParams({ limit: nextLimit, page: DEFAULT_PAGE }));
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
                  href={buildUrlWithParams({ page: Math.max(DEFAULT_PAGE, page - 1) })}
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
                    <PaginationLink href={buildUrlWithParams({ page: item })} isActive={item === page}>
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href={buildUrlWithParams({ page: Math.min(totalPages, page + 1) })}
                  aria-disabled={page >= totalPages}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
        </TabsContent>

        <TabsContent value="trash">
          <DeletedProductsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
