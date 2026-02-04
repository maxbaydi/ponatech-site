'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/catalog';
import { useProducts } from '@/lib/hooks/use-products';

const FEATURED_PRODUCTS_LIMIT = 8;
const FEATURED_ERROR_MESSAGE = 'Не удалось загрузить товары';
const RETRY_LABEL = 'Повторить';

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  );
}

export function FeaturedProducts() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const { data: productsPage, isLoading, error, refetch } = useProducts({
    limit: FEATURED_PRODUCTS_LIMIT,
    status: 'PUBLISHED',
  });

  const displayProducts = productsPage?.data ?? [];
  const showError = Boolean(error) && displayProducts.length === 0;

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/30" ref={ref}>
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              Популярные товары
            </motion.h2>
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Актуальные позиции из нашего каталога
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/catalog">
                Весь каталог
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: FEATURED_PRODUCTS_LIMIT }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : showError ? (
          <div className="text-center py-10 sm:py-12">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-destructive/40 mx-auto mb-4" />
            <p className="text-destructive mb-4">{FEATURED_ERROR_MESSAGE}</p>
            <Button variant="outline" onClick={() => refetch()}>
              {RETRY_LABEL}
            </Button>
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.05 * i }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 sm:py-12">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Каталог товаров загружается…</p>
            <Button variant="outline" asChild className="mt-4 w-full sm:w-auto">
              <Link href="/catalog">Перейти в каталог</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
