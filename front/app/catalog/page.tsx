'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { useProducts } from '@/lib/hooks/use-products';
import type { ProductFilters as ProductFiltersType } from '@/lib/api/types';

function CatalogContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filters: ProductFiltersType = {
    brandId: searchParams.get('brandId') || undefined,
    brandSlug: searchParams.get('brandSlug') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    search: searchParams.get('search') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 12,
    sort: (searchParams.get('sort') as ProductFiltersType['sort']) || 'created_desc',
    status: 'PUBLISHED',
  };

  const { data: productsPage, isLoading } = useProducts(filters);
  const products = productsPage?.data ?? [];
  const totalPages = productsPage?.totalPages ?? 0;
  const currentPage = filters.page || 1;
  const resultsKey = `${searchParams.toString()}|${viewMode}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Каталог товаров</h1>
            <p className="text-muted-foreground">
              Промышленное оборудование от ведущих мировых производителей
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <ProductFilters />
            <ProductFilters isMobile />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <ProductSearch />
                <div className="flex items-center gap-4 ml-auto">
                  <ProductSort />
                  <ViewToggle view={viewMode} onViewChange={setViewMode} />
                </div>
              </div>

              {isLoading ? (
                <div
                  key={`loading-${resultsKey}`}
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 smooth-appear'
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
              ) : products.length > 0 ? (
                  <div key={`results-${resultsKey}`} className="smooth-appear">
                  <div className="text-sm text-muted-foreground mb-4">
                    Найдено товаров: {productsPage?.total ?? products.length}
                  </div>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
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
                  <div key={`empty-${resultsKey}`} className="text-center py-16 smooth-appear">
                  <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Товары не найдены</h3>
                  <p className="text-muted-foreground">
                    Попробуйте изменить параметры фильтрации или поисковый запрос
                  </p>
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
