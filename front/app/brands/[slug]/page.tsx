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

  const { data: products, isLoading: productsLoading } = useProducts({
    brandSlug: slug,
    status: 'PUBLISHED',
    limit: 12,
  });

  if (!brand) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/brands" className="hover:text-foreground transition-colors">
              Бренды
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{brand.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-start gap-6 mb-6">
                <BrandLogo
                  name={brand.name}
                  src={apiBrand?.logoUrl || staticBrand?.logo}
                  size="lg"
                  className="flex-shrink-0"
                />
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{brand.name}</h1>
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

              {(apiBrand?.description || staticBrand?.description) && (
                <p className="text-muted-foreground leading-relaxed">
                  {apiBrand?.description || staticBrand?.description}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            ) : products && products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <Button variant="outline" asChild>
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
            <Button variant="ghost" asChild>
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
