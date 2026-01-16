'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrandLogo } from '@/components/brands/brand-logo';
import { TopBrandsGrid } from '@/components/brands/top-brands-grid';
import { BRANDS, BRAND_CATEGORIES, type BrandCategory, getBrandsByCategory } from '@/data/brands';
import { cn } from '@/lib/utils';

const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'] as const;

export default function BrandsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<BrandCategory | 'all'>('all');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchInput]);

  const baseBrands = activeCategory === 'all' ? BRANDS : getBrandsByCategory(activeCategory);

  const filteredBrands = useMemo(() => {
    let result = [...baseBrands];
    
    if (searchQuery) {
      result = result.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    if (activeLetter) {
      if (activeLetter === '#') {
        result = result.filter((b) => /^[0-9]/.test(b.name));
      } else {
        result = result.filter((b) => b.name.toUpperCase().startsWith(activeLetter));
      }
    }
    
    return result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [baseBrands, searchQuery, activeLetter]);

  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    baseBrands.forEach((b) => {
      const firstChar = b.name[0].toUpperCase();
      if (/[0-9]/.test(firstChar)) {
        letters.add('#');
      } else {
        letters.add(firstChar);
      }
    });
    return letters;
  }, [baseBrands]);

  const handleLetterClick = (letter: string) => {
    setActiveLetter(activeLetter === letter ? null : letter);
    setSearchInput('');
    setSearchQuery('');
  };

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

          <TopBrandsGrid />

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по бренду"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setActiveLetter(null);
                }}
                className="pl-10 h-9"
              />
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
              {ALPHABET.map((letter) => {
                const isAvailable = availableLetters.has(letter);
                const isActive = activeLetter === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => isAvailable && handleLetterClick(letter)}
                    disabled={!isAvailable}
                    className={cn(
                      'w-6 h-7 sm:w-7 sm:h-8 text-xs sm:text-sm font-medium rounded transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : isAvailable
                          ? 'text-foreground hover:bg-muted'
                          : 'text-muted-foreground/40 cursor-not-allowed'
                    )}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          <Tabs value={activeCategory} onValueChange={(v) => { setActiveCategory(v as BrandCategory | 'all'); setActiveLetter(null); }}>
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
