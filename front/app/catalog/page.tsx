'use client';

import { useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import {
  ProductFilters,
  ProductCard,
  ProductSort,
  ProductSearch,
  ProductPagination,
  ViewToggle,
} from '@/components/catalog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/lib/hooks/use-products';
import type { ProductFilters as ProductFiltersType } from '@/lib/api/types';

const CATALOG_PATH = '/catalog';
const RETRY_LABEL = 'Повторить';
const RESET_FILTERS_LABEL = 'Сбросить фильтры';
const CATALOG_ERROR_TITLE = 'Не удалось загрузить каталог';
const CATALOG_ERROR_DESCRIPTION = 'Попробуйте повторить запрос или обновить страницу.';
const ACTIVE_FILTER_KEYS = [
  'brandId',
  'brandSlug',
  'categoryId',
  'categorySlug',
  'search',
  'minPrice',
  'maxPrice',
  'sort',
] as const;

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filters: ProductFiltersType = {
    brandId: searchParams.get('brandId') || undefined,
    brandSlug: searchParams.get('brandSlug') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    categorySlug: searchParams.get('categorySlug') || undefined,
    search: searchParams.get('search') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 12,
    sort: (searchParams.get('sort') as ProductFiltersType['sort']) || 'created_desc',
    status: 'PUBLISHED',
  };

  const { data: productsPage, isLoading, error, refetch } = useProducts(filters);
  const products = productsPage?.data ?? [];
  const totalPages = productsPage?.totalPages ?? 0;
  const currentPage = filters.page || 1;
  const resultsKey = `${searchParams.toString()}|${viewMode}`;
  const hasActiveFilters = ACTIVE_FILTER_KEYS.some((key) => Boolean(searchParams.get(key)));

  const handleResetFilters = useCallback(() => {
    router.push(CATALOG_PATH, { scroll: false });
  }, [router]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="container-custom">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Каталог товаров</h1>
            <p className="text-muted-foreground">
              Промышленное оборудование от ведущих мировых производителей
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <ProductFilters />

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4 mb-6">
                <ProductSearch />
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto sm:ml-auto">
                  <ProductSort />
                  <ViewToggle view={viewMode} onViewChange={setViewMode} />
                </div>
              </div>

              {isLoading ? (
                <div
                  key={`loading-${resultsKey}`}
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 smooth-appear'
                      : 'flex flex-col gap-4 smooth-appear'
                  }
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border overflow-hidden">
                      <Skeleton className={viewMode === 'grid' ? 'h-48 w-full' : 'h-32 w-48'} />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div key={`error-${resultsKey}`} className="text-center py-12 sm:py-16 smooth-appear">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-destructive/40 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{CATALOG_ERROR_TITLE}</h3>
                  <p className="text-muted-foreground mb-6">{CATALOG_ERROR_DESCRIPTION}</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button variant="outline" onClick={handleRetry}>
                      {RETRY_LABEL}
                    </Button>
                    {hasActiveFilters && (
                      <Button variant="ghost" onClick={handleResetFilters}>
                        {RESET_FILTERS_LABEL}
                      </Button>
                    )}
                  </div>
                </div>
              ) : products.length > 0 ? (
                  <div key={`results-${resultsKey}`} className="smooth-appear">
                  <div className="text-sm text-muted-foreground mb-4">
                    Найдено товаров: {productsPage?.total ?? products.length}
                  </div>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
                        : 'flex flex-col gap-4'
                    }
                  >
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} viewMode={viewMode} />
                    ))}
                  </div>

                  <div className="mt-8">
                    <ProductPagination currentPage={currentPage} totalPages={totalPages} />
                  </div>
                  </div>
              ) : (
                  <div key={`empty-${resultsKey}`} className="text-center py-12 sm:py-16 smooth-appear">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Товары не найдены</h3>
                  <p className="text-muted-foreground">
                    Попробуйте изменить параметры фильтрации или поисковый запрос
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" className="mt-4" onClick={handleResetFilters}>
                      {RESET_FILTERS_LABEL}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Загрузка...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
