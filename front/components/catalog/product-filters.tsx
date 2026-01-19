'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, SlidersHorizontal, ChevronRight } from 'lucide-react';
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
import type { Category } from '@/lib/api/types';

interface ProductFiltersProps {
  isMobile?: boolean;
}

type FilterItem = {
  id: string;
  name: string;
};

type CategoryFilterItem = FilterItem & {
  level: number;
};

function flattenCategoriesForFilter(categories: Category[], level = 0): CategoryFilterItem[] {
  const result: CategoryFilterItem[] = [];
  for (const cat of categories) {
    result.push({ id: cat.id, name: cat.name, level });
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenCategoriesForFilter(cat.children, level + 1));
    }
  }
  return result;
}

const CATALOG_PATH = '/catalog';
const FILTER_VALUE_SEPARATOR = ',';
const PAGE_RESET_VALUE = '1';
const PRICE_DEBOUNCE_MS = 500;
const SKELETON_ITEMS_COUNT = 5;
const SKELETON_ITEMS = Array.from({ length: SKELETON_ITEMS_COUNT }, (_, index) => index);
const EMPTY_VALUE = '';
const BRAND_CHECKBOX_ID_PREFIX = 'brand-';
const CATEGORY_CHECKBOX_ID_PREFIX = 'category-';
const BRAND_SEARCH_PLACEHOLDER = 'Поиск бренда';
const BRAND_EMPTY_MESSAGE = 'Бренды не найдены';
const CATEGORY_EMPTY_MESSAGE = 'Категории не найдены';
const PRICE_LABEL = 'Цена (₽)';
const BRANDS_LABEL = 'Бренды';
const CATEGORIES_LABEL = 'Категории';
const CLEAR_FILTERS_LABEL = 'Сбросить фильтры';
const FILTERS_TITLE = 'Фильтры';
const PRICE_MIN_PLACEHOLDER = 'От';
const PRICE_MAX_PLACEHOLDER = 'До';
const CLEAR_BRAND_SEARCH_LABEL = 'Очистить поиск';

const FILTER_QUERY_KEYS = {
  brandId: 'brandId',
  categoryId: 'categoryId',
  minPrice: 'minPrice',
  maxPrice: 'maxPrice',
  page: 'page',
} as const;

const setOptionalParam = (params: URLSearchParams, key: string, value: string) => {
  if (value) {
    params.set(key, value);
    return;
  }

  params.delete(key);
};

const setArrayParam = (params: URLSearchParams, key: string, values: string[]) => {
  if (values.length > 0) {
    params.set(key, values.join(FILTER_VALUE_SEPARATOR));
    return;
  }

  params.delete(key);
};

const orderSelectedFirst = <T extends FilterItem>(items: T[], selectedIds: Set<string>): T[] => {
  if (selectedIds.size === 0 || items.length === 0) return items;

  const selected: T[] = [];
  const unselected: T[] = [];

  items.forEach((item) => {
    if (selectedIds.has(item.id)) {
      selected.push(item);
      return;
    }

    unselected.push(item);
  });

  return selected.length > 0 ? [...selected, ...unselected] : items;
};

interface FilterSectionProps {
  label: string;
  children: ReactNode;
}

function FilterSection({ label, children }: FilterSectionProps) {
  return (
    <div>
      <Label className="text-sm font-semibold mb-3 block">{label}</Label>
      {children}
    </div>
  );
}

interface FilterListProps {
  items: FilterItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  idPrefix: string;
  emptyMessage: string;
  isLoading: boolean;
}

function FilterSkeletonList() {
  return (
    <div className="space-y-2">
      {SKELETON_ITEMS.map((index) => (
        <Skeleton key={index} className="h-6 w-full" />
      ))}
    </div>
  );
}

function FilterList({ items, selectedIds, onToggle, idPrefix, emptyMessage, isLoading }: FilterListProps) {
  return (
    <ScrollArea className="h-48">
      {isLoading ? (
        <FilterSkeletonList />
      ) : items.length > 0 ? (
        <div className="space-y-2 pr-4">
          {items.map((item) => {
            const checkboxId = `${idPrefix}${item.id}`;
            return (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={checkboxId}
                  checked={selectedIds.has(item.id)}
                  onCheckedChange={() => onToggle(item.id)}
                />
                <label htmlFor={checkboxId} className="text-sm cursor-pointer flex-1 truncate">
                  {item.name}
                </label>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="pr-4">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </ScrollArea>
  );
}

interface CategoryFilterListProps {
  items: CategoryFilterItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  emptyMessage: string;
  isLoading: boolean;
}

function CategoryFilterList({ items, selectedIds, onToggle, emptyMessage, isLoading }: CategoryFilterListProps) {
  return (
    <ScrollArea className="h-48">
      {isLoading ? (
        <FilterSkeletonList />
      ) : items.length > 0 ? (
        <div className="space-y-2 pr-4">
          {items.map((item) => {
            const checkboxId = `${CATEGORY_CHECKBOX_ID_PREFIX}${item.id}`;
            return (
              <div key={item.id} className="flex items-center space-x-2">
                {item.level > 0 && (
                  <span 
                    className="text-muted-foreground flex items-center"
                    style={{ marginLeft: `${(item.level - 1) * 12}px` }}
                  >
                    <ChevronRight className="w-3 h-3" />
                  </span>
                )}
                <Checkbox
                  id={checkboxId}
                  checked={selectedIds.has(item.id)}
                  onCheckedChange={() => onToggle(item.id)}
                />
                <label htmlFor={checkboxId} className="text-sm cursor-pointer flex-1 truncate">
                  {item.name}
                </label>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="pr-4">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </ScrollArea>
  );
}

function FilterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const selectedBrands =
    searchParams.get(FILTER_QUERY_KEYS.brandId)?.split(FILTER_VALUE_SEPARATOR).filter(Boolean) || [];
  const selectedCategories =
    searchParams.get(FILTER_QUERY_KEYS.categoryId)?.split(FILTER_VALUE_SEPARATOR).filter(Boolean) || [];
  const minPriceParam = searchParams.get(FILTER_QUERY_KEYS.minPrice) || EMPTY_VALUE;
  const maxPriceParam = searchParams.get(FILTER_QUERY_KEYS.maxPrice) || EMPTY_VALUE;
  const [minPriceValue, setMinPriceValue] = useState(minPriceParam);
  const [maxPriceValue, setMaxPriceValue] = useState(maxPriceParam);
  const [brandQuery, setBrandQuery] = useState(EMPTY_VALUE);
  const isUserTypingPrice = useRef(false);
  const priceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedBrandSet = useMemo(() => new Set(selectedBrands), [selectedBrands]);
  const selectedCategorySet = useMemo(() => new Set(selectedCategories), [selectedCategories]);

  const filteredBrands = useMemo(() => {
    if (!brands) return [];
    const query = brandQuery.trim().toLowerCase();
    const baseList = query ? brands.filter((brand) => brand.name.toLowerCase().includes(query)) : brands;
    return orderSelectedFirst(baseList, selectedBrandSet);
  }, [brands, brandQuery, selectedBrandSet]);

  const flatCategories = useMemo(() => {
    if (!categories) return [];
    return flattenCategoriesForFilter(categories);
  }, [categories]);

  const orderedCategories = useMemo(() => {
    if (flatCategories.length === 0) return [];
    if (selectedCategorySet.size === 0) return flatCategories;
    
    const selected: CategoryFilterItem[] = [];
    const unselected: CategoryFilterItem[] = [];
    
    flatCategories.forEach((item) => {
      if (selectedCategorySet.has(item.id)) {
        selected.push(item);
      } else {
        unselected.push(item);
      }
    });
    
    return selected.length > 0 ? [...selected, ...unselected] : flatCategories;
  }, [flatCategories, selectedCategorySet]);

  const clearPriceDebounce = useCallback(() => {
    if (!priceDebounceRef.current) return;
    clearTimeout(priceDebounceRef.current);
    priceDebounceRef.current = null;
  }, []);

  const handlePriceInputChange = useCallback((setter: (value: string) => void, value: string) => {
    isUserTypingPrice.current = true;
    setter(value);
  }, []);

  const clearBrandSearch = () => {
    setBrandQuery(EMPTY_VALUE);
  };

  const navigateWithParams = useCallback(
    (params: URLSearchParams) => {
      params.set(FILTER_QUERY_KEYS.page, PAGE_RESET_VALUE);
      router.push(`${CATALOG_PATH}?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    const nextMin = searchParams.get(FILTER_QUERY_KEYS.minPrice) || EMPTY_VALUE;
    const nextMax = searchParams.get(FILTER_QUERY_KEYS.maxPrice) || EMPTY_VALUE;

    if (!isUserTypingPrice.current) {
      if (nextMin !== minPriceValue) setMinPriceValue(nextMin);
      if (nextMax !== maxPriceValue) setMaxPriceValue(nextMax);
    }
  }, [searchParams, minPriceValue, maxPriceValue]);

  const updateFilters = useCallback(
    (key: string, value: string | string[]) => {
      const params = new URLSearchParams(searchParams.toString());

      if (Array.isArray(value)) {
        setArrayParam(params, key, value);
      } else {
        setOptionalParam(params, key, value);
      }

      navigateWithParams(params);
    },
    [navigateWithParams, searchParams]
  );

  const schedulePriceUpdate = useCallback(
    (nextMin: string, nextMax: string) => {
      clearPriceDebounce();

      priceDebounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());

        setOptionalParam(params, FILTER_QUERY_KEYS.minPrice, nextMin);
        setOptionalParam(params, FILTER_QUERY_KEYS.maxPrice, nextMax);

        navigateWithParams(params);
        isUserTypingPrice.current = false;
      }, PRICE_DEBOUNCE_MS);
    },
    [clearPriceDebounce, navigateWithParams]
  );

  useEffect(() => {
    if (isUserTypingPrice.current) {
      schedulePriceUpdate(minPriceValue, maxPriceValue);
    }
  }, [minPriceValue, maxPriceValue, schedulePriceUpdate]);

  useEffect(() => {
    return () => {
      clearPriceDebounce();
    };
  }, [clearPriceDebounce]);

  const toggleBrand = (brandId: string) => {
    const newBrands = selectedBrandSet.has(brandId)
      ? selectedBrands.filter((id) => id !== brandId)
      : [...selectedBrands, brandId];
    updateFilters(FILTER_QUERY_KEYS.brandId, newBrands);
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = selectedCategorySet.has(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    updateFilters(FILTER_QUERY_KEYS.categoryId, newCategories);
  };

  const clearFilters = () => {
    clearPriceDebounce();
    isUserTypingPrice.current = false;
    setMinPriceValue(EMPTY_VALUE);
    setMaxPriceValue(EMPTY_VALUE);
    clearBrandSearch();
    router.push(CATALOG_PATH, { scroll: false });
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
          {CLEAR_FILTERS_LABEL}
        </Button>
      )}

      <FilterSection label={PRICE_LABEL}>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder={PRICE_MIN_PLACEHOLDER}
            value={minPriceValue}
            onChange={(event) => handlePriceInputChange(setMinPriceValue, event.target.value)}
            className="h-9"
          />
          <Input
            type="number"
            placeholder={PRICE_MAX_PLACEHOLDER}
            value={maxPriceValue}
            onChange={(event) => handlePriceInputChange(setMaxPriceValue, event.target.value)}
            className="h-9"
          />
        </div>
      </FilterSection>

      <Separator />

      <FilterSection label={BRANDS_LABEL}>
        <div className="relative mb-3">
          <Input
            type="search"
            placeholder={BRAND_SEARCH_PLACEHOLDER}
            value={brandQuery}
            onChange={(event) => setBrandQuery(event.target.value)}
            className="h-8 pr-8"
          />
          {brandQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearBrandSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              aria-label={CLEAR_BRAND_SEARCH_LABEL}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <FilterList
          items={filteredBrands}
          selectedIds={selectedBrandSet}
          onToggle={toggleBrand}
          idPrefix={BRAND_CHECKBOX_ID_PREFIX}
          emptyMessage={BRAND_EMPTY_MESSAGE}
          isLoading={brandsLoading}
        />
      </FilterSection>

      <Separator />

      <FilterSection label={CATEGORIES_LABEL}>
        <CategoryFilterList
          items={orderedCategories}
          selectedIds={selectedCategorySet}
          onToggle={toggleCategory}
          emptyMessage={CATEGORY_EMPTY_MESSAGE}
          isLoading={categoriesLoading}
        />
      </FilterSection>
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
            {FILTERS_TITLE}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-80">
          <SheetHeader>
            <SheetTitle>{FILTERS_TITLE}</SheetTitle>
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
          {FILTERS_TITLE}
        </h3>
        <FilterContent />
      </div>
    </div>
  );
}
