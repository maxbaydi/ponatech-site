'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBrands } from '@/lib/hooks/use-brands';
import { useCategories } from '@/lib/hooks/use-categories';
import { useDisplayCurrency } from '@/lib/hooks/use-site-settings';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrencySymbol } from '@/lib/currency';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/api/types';

type FilterItem = {
  id: string;
  name: string;
};

type CategoryFilterItem = FilterItem & {
  level: number;
};

const CATALOG_PATH = '/catalog';
export const FILTER_VALUE_SEPARATOR = ',';
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
const PRICE_MIN_PLACEHOLDER = 'От';
const PRICE_MAX_PLACEHOLDER = 'До';
const CLEAR_BRAND_SEARCH_LABEL = 'Очистить поиск';
const BRAND_SEARCH_INPUT_TYPE = 'search';
const PRICE_MIN_VALUE = 0;
const PRICE_NEGATIVE_ERROR = 'Цена не может быть отрицательной';
const PRICE_RANGE_ERROR = 'Минимальная цена не может быть больше максимальной';
const BRANDS_ERROR_MESSAGE = 'Не удалось загрузить бренды';
const CATEGORIES_ERROR_MESSAGE = 'Не удалось загрузить категории';
const FILTER_RETRY_LABEL = 'Повторить';
const FILTER_SECTION_LABEL_BASE_CLASS = 'text-sm font-semibold block';
const FILTER_PANEL_CONTENT_GAP = 'space-y-6';
const FILTER_PANEL_LIST_HEIGHT = 'h-48';
const FILTER_PANEL_SECTION_LABEL_MARGIN = 'mb-3';
const CATEGORY_INDENT_STEP_PX = 12;

export const FILTER_QUERY_KEYS = {
  brandId: 'brandId',
  categoryId: 'categoryId',
  minPrice: 'minPrice',
  maxPrice: 'maxPrice',
  page: 'page',
} as const;

export const FILTER_MULTI_VALUE_KEYS = [FILTER_QUERY_KEYS.brandId, FILTER_QUERY_KEYS.categoryId] as const;

export const FILTER_ACTIVE_QUERY_KEYS = [
  FILTER_QUERY_KEYS.brandId,
  FILTER_QUERY_KEYS.categoryId,
  FILTER_QUERY_KEYS.minPrice,
  FILTER_QUERY_KEYS.maxPrice,
] as const;

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

const parsePriceValue = (value: string): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getPriceRangeError = (minValue: string, maxValue: string): string => {
  const min = parsePriceValue(minValue);
  const max = parsePriceValue(maxValue);

  if ((min !== null && min < PRICE_MIN_VALUE) || (max !== null && max < PRICE_MIN_VALUE)) {
    return PRICE_NEGATIVE_ERROR;
  }

  if (min !== null && max !== null && min > max) {
    return PRICE_RANGE_ERROR;
  }

  return '';
};

const flattenCategoriesForFilter = (categories: Category[], level = 0): CategoryFilterItem[] => {
  const result: CategoryFilterItem[] = [];
  for (const cat of categories) {
    result.push({ id: cat.id, name: cat.name, level });
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenCategoriesForFilter(cat.children, level + 1));
    }
  }
  return result;
};

interface FilterSectionProps {
  label: string;
  children: ReactNode;
  labelClassName?: string;
}

function FilterSection({ label, children, labelClassName }: FilterSectionProps) {
  return (
    <div>
      <Label className={cn(FILTER_SECTION_LABEL_BASE_CLASS, labelClassName)}>{label}</Label>
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
  errorMessage?: string;
  onRetry?: () => void;
  heightClassName: string;
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

interface FilterErrorProps {
  message: string;
  onRetry?: () => void;
}

function FilterError({ message, onRetry }: FilterErrorProps) {
  return (
    <div className="space-y-2 pr-4">
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {FILTER_RETRY_LABEL}
        </Button>
      )}
    </div>
  );
}

function FilterList({
  items,
  selectedIds,
  onToggle,
  idPrefix,
  emptyMessage,
  isLoading,
  errorMessage,
  onRetry,
  heightClassName,
}: FilterListProps) {
  return (
    <ScrollArea className={heightClassName}>
      {isLoading ? (
        <FilterSkeletonList />
      ) : errorMessage ? (
        <FilterError message={errorMessage} onRetry={onRetry} />
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
  errorMessage?: string;
  onRetry?: () => void;
  heightClassName: string;
}

function CategoryFilterList({
  items,
  selectedIds,
  onToggle,
  emptyMessage,
  isLoading,
  errorMessage,
  onRetry,
  heightClassName,
}: CategoryFilterListProps) {
  return (
    <ScrollArea className={heightClassName}>
      {isLoading ? (
        <FilterSkeletonList />
      ) : errorMessage ? (
        <FilterError message={errorMessage} onRetry={onRetry} />
      ) : items.length > 0 ? (
        <div className="space-y-2 pr-4">
          {items.map((item) => {
            const checkboxId = `${CATEGORY_CHECKBOX_ID_PREFIX}${item.id}`;
            const indent = item.level > 0 ? (item.level - 1) * CATEGORY_INDENT_STEP_PX : 0;
            return (
              <div key={item.id} className="flex items-center space-x-2">
                {item.level > 0 && (
                  <span className="text-muted-foreground flex items-center" style={{ marginLeft: `${indent}px` }}>
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

export function FilterContent() {
  const displayCurrency = useDisplayCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const {
    data: brands,
    isLoading: brandsLoading,
    error: brandsError,
    refetch: refetchBrands,
  } = useBrands();
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const getSelectedValues = (key: string) =>
    searchParams.get(key)?.split(FILTER_VALUE_SEPARATOR).filter(Boolean) || [];

  const selectedBrands = getSelectedValues(FILTER_QUERY_KEYS.brandId);
  const selectedCategories = getSelectedValues(FILTER_QUERY_KEYS.categoryId);
  const minPriceParam = searchParams.get(FILTER_QUERY_KEYS.minPrice) || EMPTY_VALUE;
  const maxPriceParam = searchParams.get(FILTER_QUERY_KEYS.maxPrice) || EMPTY_VALUE;
  const [minPriceValue, setMinPriceValue] = useState(minPriceParam);
  const [maxPriceValue, setMaxPriceValue] = useState(maxPriceParam);
  const [brandQuery, setBrandQuery] = useState(EMPTY_VALUE);
  const isUserTypingPrice = useRef(false);
  const priceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedBrandSet = useMemo(() => new Set(selectedBrands), [selectedBrands]);
  const selectedCategorySet = useMemo(() => new Set(selectedCategories), [selectedCategories]);
  const priceLabel = useMemo(
    () => PRICE_LABEL.replace('₽', getCurrencySymbol(displayCurrency)),
    [displayCurrency]
  );
  const priceError = useMemo(
    () => getPriceRangeError(minPriceValue, maxPriceValue),
    [maxPriceValue, minPriceValue]
  );

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

  const orderedCategories = useMemo(
    () => orderSelectedFirst(flatCategories, selectedCategorySet),
    [flatCategories, selectedCategorySet]
  );

  const clearPriceDebounce = useCallback(() => {
    if (!priceDebounceRef.current) return;
    clearTimeout(priceDebounceRef.current);
    priceDebounceRef.current = null;
  }, []);

  const handleRetryBrands = useCallback(() => {
    refetchBrands();
  }, [refetchBrands]);

  const handleRetryCategories = useCallback(() => {
    refetchCategories();
  }, [refetchCategories]);

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

  const toggleSelection = useCallback(
    (id: string, selectedSet: Set<string>, selectedList: string[], key: string) => {
      const nextValues = selectedSet.has(id)
        ? selectedList.filter((value) => value !== id)
        : [...selectedList, id];
      updateFilters(key, nextValues);
    },
    [updateFilters]
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
    if (isUserTypingPrice.current && !priceError) {
      schedulePriceUpdate(minPriceValue, maxPriceValue);
    }
  }, [minPriceValue, maxPriceValue, priceError, schedulePriceUpdate]);

  useEffect(() => {
    return () => {
      clearPriceDebounce();
    };
  }, [clearPriceDebounce]);

  const toggleBrand = (brandId: string) => {
    toggleSelection(brandId, selectedBrandSet, selectedBrands, FILTER_QUERY_KEYS.brandId);
  };

  const toggleCategory = (categoryId: string) => {
    toggleSelection(categoryId, selectedCategorySet, selectedCategories, FILTER_QUERY_KEYS.categoryId);
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

  const sectionLabelClassName = FILTER_PANEL_SECTION_LABEL_MARGIN;
  const listHeightClassName = FILTER_PANEL_LIST_HEIGHT;

  return (
    <div className={FILTER_PANEL_CONTENT_GAP}>
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

      <FilterSection label={priceLabel} labelClassName={sectionLabelClassName}>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder={PRICE_MIN_PLACEHOLDER}
            value={minPriceValue}
            onChange={(event) => handlePriceInputChange(setMinPriceValue, event.target.value)}
            className="h-9"
            min={PRICE_MIN_VALUE}
          />
          <Input
            type="number"
            placeholder={PRICE_MAX_PLACEHOLDER}
            value={maxPriceValue}
            onChange={(event) => handlePriceInputChange(setMaxPriceValue, event.target.value)}
            className="h-9"
            min={PRICE_MIN_VALUE}
          />
        </div>
        {priceError && <p className="text-xs text-destructive mt-2">{priceError}</p>}
      </FilterSection>

      <Separator />

      <FilterSection label={BRANDS_LABEL} labelClassName={sectionLabelClassName}>
        <div className="relative mb-3">
          <Input
            type={BRAND_SEARCH_INPUT_TYPE}
            placeholder={BRAND_SEARCH_PLACEHOLDER}
            value={brandQuery}
            onChange={(event) => setBrandQuery(event.target.value)}
            className="h-8 pr-8"
            aria-label={BRAND_SEARCH_PLACEHOLDER}
            name="brandFilterSearch"
            autoComplete="off"
            inputMode="search"
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
              <X className="h-4 w-4" aria-hidden="true" />
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
          errorMessage={brandsError ? BRANDS_ERROR_MESSAGE : undefined}
          onRetry={brandsError ? handleRetryBrands : undefined}
          heightClassName={listHeightClassName}
        />
      </FilterSection>

      <Separator />

      <FilterSection label={CATEGORIES_LABEL} labelClassName={sectionLabelClassName}>
        <CategoryFilterList
          items={orderedCategories}
          selectedIds={selectedCategorySet}
          onToggle={toggleCategory}
          emptyMessage={CATEGORY_EMPTY_MESSAGE}
          isLoading={categoriesLoading}
          errorMessage={categoriesError ? CATEGORIES_ERROR_MESSAGE : undefined}
          onRetry={categoriesError ? handleRetryCategories : undefined}
          heightClassName={listHeightClassName}
        />
      </FilterSection>
    </div>
  );
}
