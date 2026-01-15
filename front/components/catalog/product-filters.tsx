'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useBrands } from '@/lib/hooks/use-brands';
import { useCategories } from '@/lib/hooks/use-categories';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductFiltersProps {
  isMobile?: boolean;
}

function FilterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const selectedBrands = searchParams.get('brandId')?.split(',').filter(Boolean) || [];
  const selectedCategories = searchParams.get('categoryId')?.split(',').filter(Boolean) || [];
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const [minPriceValue, setMinPriceValue] = useState(minPriceParam);
  const [maxPriceValue, setMaxPriceValue] = useState(maxPriceParam);
  const isUserTypingPrice = useRef(false);
  const priceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const nextMin = searchParams.get('minPrice') || '';
    const nextMax = searchParams.get('maxPrice') || '';

    if (!isUserTypingPrice.current) {
      if (nextMin !== minPriceValue) setMinPriceValue(nextMin);
      if (nextMax !== maxPriceValue) setMaxPriceValue(nextMax);
    }
  }, [searchParams, minPriceValue, maxPriceValue]);

  const updateFilters = useCallback(
    (key: string, value: string | string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join(','));
        } else {
          params.delete(key);
        }
      } else if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      
      params.set('page', '1');
      router.push(`/catalog?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const schedulePriceUpdate = useCallback(
    (nextMin: string, nextMax: string) => {
      if (priceDebounceRef.current) {
        clearTimeout(priceDebounceRef.current);
      }

      priceDebounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());

        if (nextMin) {
          params.set('minPrice', nextMin);
        } else {
          params.delete('minPrice');
        }

        if (nextMax) {
          params.set('maxPrice', nextMax);
        } else {
          params.delete('maxPrice');
        }

        params.set('page', '1');
        router.push(`/catalog?${params.toString()}`, { scroll: false });
        isUserTypingPrice.current = false;
      }, 500);
    },
    [router]
  );

  useEffect(() => {
    if (isUserTypingPrice.current) {
      schedulePriceUpdate(minPriceValue, maxPriceValue);
    }
  }, [minPriceValue, maxPriceValue, schedulePriceUpdate]);

  useEffect(() => {
    return () => {
      if (priceDebounceRef.current) {
        clearTimeout(priceDebounceRef.current);
      }
    };
  }, []);

  const toggleBrand = (brandId: string) => {
    const newBrands = selectedBrands.includes(brandId)
      ? selectedBrands.filter((id) => id !== brandId)
      : [...selectedBrands, brandId];
    updateFilters('brandId', newBrands);
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    updateFilters('categoryId', newCategories);
  };

  const clearFilters = () => {
    if (priceDebounceRef.current) {
      clearTimeout(priceDebounceRef.current);
    }
    isUserTypingPrice.current = false;
    setMinPriceValue('');
    setMaxPriceValue('');
    router.push('/catalog', { scroll: false });
  };

  const hasActiveFilters =
    selectedBrands.length > 0 || selectedCategories.length > 0 || minPriceValue || maxPriceValue;

  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="w-full justify-start text-destructive smooth-appear"
        >
          <X className="mr-2 h-4 w-4" />
          Сбросить фильтры
        </Button>
      )}

      <div>
        <Label className="text-sm font-semibold mb-3 block">Цена (₽)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="От"
            value={minPriceValue}
            onChange={(e) => {
              isUserTypingPrice.current = true;
              setMinPriceValue(e.target.value);
            }}
            className="h-9"
          />
          <Input
            type="number"
            placeholder="До"
            value={maxPriceValue}
            onChange={(e) => {
              isUserTypingPrice.current = true;
              setMaxPriceValue(e.target.value);
            }}
            className="h-9"
          />
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-sm font-semibold mb-3 block">Бренды</Label>
        <ScrollArea className="h-48">
          {brandsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 pr-4">
              {brands?.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={selectedBrands.includes(brand.id)}
                    onCheckedChange={() => toggleBrand(brand.id)}
                  />
                  <label
                    htmlFor={`brand-${brand.id}`}
                    className="text-sm cursor-pointer flex-1 truncate"
                  >
                    {brand.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <Separator />

      <div>
        <Label className="text-sm font-semibold mb-3 block">Категории</Label>
        <ScrollArea className="h-48">
          {categoriesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 pr-4">
              {categories?.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm cursor-pointer flex-1 truncate"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export function ProductFilters({ isMobile }: ProductFiltersProps) {
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Фильтры
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-80">
          <SheetHeader>
            <SheetTitle>Фильтры</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-24 bg-background rounded-xl border border-border p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Фильтры
        </h3>
        <FilterContent />
      </div>
    </div>
  );
}
