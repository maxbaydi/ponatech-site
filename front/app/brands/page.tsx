'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrandLogo } from '@/components/brands/brand-logo';
import { BRANDS, BRAND_CATEGORIES, type BrandCategory, getBrandsByCategory } from '@/data/brands';

export default function BrandsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<BrandCategory | 'all'>('all');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchInput]);

  const filteredBrands =
    activeCategory === 'all'
      ? BRANDS.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : getBrandsByCategory(activeCategory).filter((b) =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Бренды</h1>
            <p className="text-muted-foreground">
              Мы работаем с {BRANDS.length}+ мировыми производителями промышленного оборудования
            </p>
          </div>

          <div className="relative w-full sm:max-w-md mb-6 sm:mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Найти бренд..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as BrandCategory | 'all')}>
            <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0 mb-8">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full px-4"
              >
                Все ({BRANDS.length})
              </TabsTrigger>
              {(Object.entries(BRAND_CATEGORIES) as [BrandCategory, string][]).map(([key, label]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full px-4"
                >
                  {label} ({getBrandsByCategory(key).length})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeCategory} className="mt-0">
              {filteredBrands.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredBrands.map((brand, i) => (
                    <motion.div
                      key={brand.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.02 }}
                    >
                      <Link href={`/brands/${brand.slug}`}>
                        <Card className="group card-hover h-full">
                          <CardContent className="p-4 text-center">
                            <BrandLogo
                              name={brand.name}
                              src={brand.logo}
                              size="md"
                              className="mx-auto mb-3 w-12 h-12 sm:w-16 sm:h-16"
                              imgClassName="w-12 h-12 sm:w-20 sm:h-20"
                            />
                            <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                              {brand.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">{brand.country}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Бренды не найдены</h3>
                  <p className="text-muted-foreground">Попробуйте изменить поисковый запрос</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
