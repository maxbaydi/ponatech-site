'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowLeft, ExternalLink, MapPin } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/catalog';
import { BrandLogo } from '@/components/brands/brand-logo';
import { useProducts } from '@/lib/hooks/use-products';
import { useBrands } from '@/lib/hooks/use-brands';
import { getBrandBySlug, BRAND_CATEGORIES } from '@/data/brands';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export default function BrandPage({ params }: BrandPageProps) {
  const { slug } = use(params);
  const staticBrand = getBrandBySlug(slug);
  const { data: brands } = useBrands();
  const apiBrand = brands?.find((b) => b.slug === slug);
  
  const brand = apiBrand || staticBrand;

  const { data: productsPage, isLoading: productsLoading } = useProducts({
    brandSlug: slug,
    status: 'PUBLISHED',
    limit: 12,
  });
  const products = productsPage?.data ?? [];

  if (!brand) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="container-custom">
          <nav className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-6">
            <Link href="/brands" className="hover:text-foreground transition-colors">
              Бренды
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{brand.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-10 sm:mb-12">
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-6">
                <BrandLogo
                  name={brand.name}
                  src={apiBrand?.logoUrl || staticBrand?.logo}
                  size="lg"
                  className="flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24"
                  imgClassName="w-10 h-10 sm:w-16 sm:h-16"
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{brand.name}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    {(brand.country || staticBrand?.country) && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {brand.country || staticBrand?.country}
                      </Badge>
                    )}
                    {staticBrand?.category && (
                      <Badge variant="outline">
                        {BRAND_CATEGORIES[staticBrand.category]}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {staticBrand?.about && (
                <p className="text-muted-foreground leading-relaxed mt-4">
                  {staticBrand.about}
                </p>
              )}
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Заказать оборудование {brand.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Мы осуществляем прямые поставки оборудования {brand.name} из официальных каналов с полным
                  документальным сопровождением.
                </p>
                <div className="space-y-2">
                  <Button className="w-full" asChild>
                    <Link href={`/request?brand=${encodeURIComponent(brand.name)}`}>Оставить заявку</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/contacts">Связаться с нами</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Товары {brand.name}</h2>
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <Button variant="outline" asChild className="w-full sm:w-auto">
                    <Link href={`/catalog?brandSlug=${encodeURIComponent(slug)}`}>
                      Все товары {brand.name}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Товары этого бренда появятся в каталоге в ближайшее время.
                  </p>
                  <Button asChild>
                    <Link href={`/request?brand=${encodeURIComponent(brand.name)}`}>
                      Запросить товар {brand.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mt-8">
            <Button variant="ghost" asChild className="w-full sm:w-auto">
              <Link href="/brands">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Все бренды
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
