'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FocusEvent, FormEvent, KeyboardEvent, MutableRefObject, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BrandLogo } from '@/components/brands/brand-logo';
import { BRANDS } from '@/data/brands';
import { apiClient } from '@/lib/api/client';
import { useBrands } from '@/lib/hooks/use-brands';
import { useDisplayCurrency } from '@/lib/hooks/use-site-settings';
import { cn, formatPrice } from '@/lib/utils';
import type { ProductFilters, Product, PaginatedResponse } from '@/lib/api/types';

type HeaderSearchProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  brandsPath: string;
  productBasePath: string;
};

type HeaderBrandOption = { name: string; slug: string; logoSrc?: string | null };

type SuggestionItem = {
  id: string;
  slug: string;
  title: string;
  sku: string;
  brandName?: string;
  price: string;
};

type TimeoutHandle = ReturnType<typeof setTimeout>;

const BRAND_LABEL_FULL = 'Бренды';
const BRAND_LABEL_SHORT = 'Бренд';
const ALL_BRANDS_LABEL = 'Все бренды';
const SEARCH_PLACEHOLDER = 'Искать на PonaTech...';
const SEARCH_LABEL = 'Поиск';
const SEARCH_NOT_FOUND_LABEL = 'Ничего не найдено';
const SEARCH_MIN_QUERY_LABEL = 'Введите минимум';
const SEARCH_RESULTS_LABEL = 'Показать все результаты';
const SEARCH_RESULTS_COUNT_LABEL = 'Найдено товаров';
const SKU_LABEL = 'SKU:';

const SORT_LOCALE = 'ru';
const SUGGESTIONS_LIMIT = 6;
const SUGGESTIONS_MIN_QUERY_LENGTH = 2;
const SUGGESTIONS_DEBOUNCE_MS = 250;
const SUGGESTIONS_OPEN_DELAY_MS = 80;
const SUGGESTIONS_CLOSE_DELAY_MS = 120;
const SUGGESTIONS_STALE_TIME_MS = 30000;
const SUGGESTIONS_PAGE = 1;
const SUGGESTIONS_STATUS: ProductFilters['status'] = 'PUBLISHED';
const SUGGESTIONS_SORT: ProductFilters['sort'] = 'title_asc';
const SUGGESTION_SKELETON_COUNT = 3;
const MIN_QUERY_HINT = `${SEARCH_MIN_QUERY_LABEL} ${SUGGESTIONS_MIN_QUERY_LENGTH} символа`;

function PanelMessage({ children }: { children: ReactNode }) {
  return <div className="px-3 py-2 text-sm text-muted-foreground">{children}</div>;
}

type SuggestionRowProps = {
  item: SuggestionItem;
  href: string;
  isActive: boolean;
  onHover: () => void;
  onSelect: () => void;
  id: string;
};

function SuggestionRow({ item, href, isActive, onHover, onSelect, id }: SuggestionRowProps) {
  return (
    <Link
      id={id}
      href={href}
      role="option"
      aria-selected={isActive}
      tabIndex={-1}
      onMouseEnter={onHover}
      onClick={onSelect}
      className={cn(
        'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        isActive ? 'bg-muted text-foreground' : 'text-foreground hover:bg-muted',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="font-medium line-clamp-2">{item.title}</div>
        <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
          <span>
            {SKU_LABEL} {item.sku}
          </span>
          {item.brandName ? <span>{item.brandName}</span> : null}
        </div>
      </div>
      <div className="text-sm font-semibold text-primary whitespace-nowrap shrink-0">{item.price}</div>
    </Link>
  );
}

export function HeaderSearch({ value, onValueChange, onSubmit, brandsPath, productBasePath }: HeaderSearchProps) {
  const router = useRouter();
  const { data: apiBrands } = useBrands();
  const displayCurrency = useDisplayCurrency();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const openTimerRef = useRef<TimeoutHandle | null>(null);
  const closeTimerRef = useRef<TimeoutHandle | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value.trim());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const trimmedValue = value.trim();
  const hasInput = trimmedValue.length > 0;
  const immediateHasQuery = trimmedValue.length >= SUGGESTIONS_MIN_QUERY_LENGTH;
  const debouncedHasQuery = debouncedValue.length >= SUGGESTIONS_MIN_QUERY_LENGTH;

  const brandOptions = useMemo<HeaderBrandOption[]>(() => {
    const map = new Map<string, HeaderBrandOption>();

    apiBrands?.forEach((b) => {
      if (!b?.slug || !b?.name) return;
      map.set(b.slug, { slug: b.slug, name: b.name, logoSrc: b.logoUrl });
    });

    BRANDS.forEach((b) => {
      if (!map.has(b.slug)) {
        map.set(b.slug, { slug: b.slug, name: b.name, logoSrc: b.logo });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, SORT_LOCALE, { sensitivity: 'base' }),
    );
  }, [apiBrands]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(trimmedValue), SUGGESTIONS_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [trimmedValue]);

  const shouldFetch = debouncedHasQuery && (isFocused || isHovered);

  const { data: suggestionsPage, isFetching } = useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', 'suggestions', debouncedValue],
    queryFn: () =>
      apiClient.getProducts({
        search: debouncedValue,
        limit: SUGGESTIONS_LIMIT,
        page: SUGGESTIONS_PAGE,
        status: SUGGESTIONS_STATUS,
        sort: SUGGESTIONS_SORT,
      }),
    enabled: shouldFetch,
    staleTime: SUGGESTIONS_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });

  const suggestionItems = useMemo(() => {
    if (!debouncedHasQuery) return [];
    const items = suggestionsPage?.data ?? [];
    return items.slice(0, SUGGESTIONS_LIMIT).map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      sku: product.sku,
      brandName: product.brand?.name,
      price: formatPrice(product.price, displayCurrency),
    }));
  }, [debouncedHasQuery, displayCurrency, suggestionsPage]);

  const totalResults = debouncedHasQuery ? suggestionsPage?.total ?? 0 : 0;
  const isDebouncePending = immediateHasQuery && trimmedValue !== debouncedValue;
  const showLoading = (debouncedHasQuery && isFetching) || isDebouncePending;
  const showHint = hasInput && !immediateHasQuery;
  const showEmpty = debouncedHasQuery && !isFetching && suggestionItems.length === 0;
  const showPanel = (isFocused || isHovered) && (showLoading || showHint || showEmpty || suggestionItems.length > 0);
  const showResultsAction = debouncedHasQuery && totalResults > 0;
  const activeDescendantId = activeIndex !== null ? `${listboxId}-item-${activeIndex}` : undefined;

  const clearTimer = useCallback((ref: MutableRefObject<TimeoutHandle | null>) => {
    if (ref.current) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  }, []);

  const openPanel = useCallback(() => {
    clearTimer(closeTimerRef);
    if (isOpen || openTimerRef.current) return;
    openTimerRef.current = setTimeout(() => {
      setIsOpen(true);
      openTimerRef.current = null;
    }, SUGGESTIONS_OPEN_DELAY_MS);
  }, [clearTimer, isOpen]);

  const closePanel = useCallback(
    (immediate = false) => {
      clearTimer(openTimerRef);
      if (immediate) {
        clearTimer(closeTimerRef);
        setIsOpen(false);
        return;
      }
      if (!isOpen || closeTimerRef.current) return;
      closeTimerRef.current = setTimeout(() => {
        setIsOpen(false);
        closeTimerRef.current = null;
      }, SUGGESTIONS_CLOSE_DELAY_MS);
    },
    [clearTimer, isOpen],
  );

  useEffect(() => {
    if (showPanel) {
      openPanel();
    } else {
      closePanel();
    }
  }, [closePanel, openPanel, showPanel]);

  useEffect(() => {
    return () => {
      clearTimer(openTimerRef);
      clearTimer(closeTimerRef);
    };
  }, [clearTimer]);

  useEffect(() => {
    setActiveIndex(null);
  }, [debouncedValue]);

  useEffect(() => {
    if (!isOpen) setActiveIndex(null);
  }, [isOpen]);

  useEffect(() => {
    if (activeIndex === null) return;
    if (activeIndex >= suggestionItems.length) {
      setActiveIndex(suggestionItems.length ? suggestionItems.length - 1 : null);
    }
  }, [activeIndex, suggestionItems.length]);

  useEffect(() => {
    if (activeIndex === null || !isOpen) return;
    const activeElement = document.getElementById(`${listboxId}-item-${activeIndex}`);
    activeElement?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen, listboxId]);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onValueChange(event.target.value);
    },
    [onValueChange],
  );

  const handleFocus = useCallback(() => setIsFocused(true), []);

  const handleBlur = useCallback((event: FocusEvent<HTMLInputElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && containerRef.current?.contains(nextTarget)) return;
    setIsFocused(false);
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit();
      closePanel(true);
    },
    [closePanel, onSubmit],
  );

  const handleViewAll = useCallback(() => {
    onSubmit();
    closePanel(true);
  }, [closePanel, onSubmit]);

  const handleSuggestionSelect = useCallback(() => {
    setIsFocused(false);
    setIsHovered(false);
    closePanel(true);
  }, [closePanel]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsFocused(false);
        closePanel(true);
        return;
      }

      if (!isOpen || suggestionItems.length === 0) return;

      const lastIndex = suggestionItems.length - 1;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) => {
          if (prev === null) return 0;
          return prev >= lastIndex ? lastIndex : prev + 1;
        });
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((prev) => {
          if (prev === null) return lastIndex;
          return prev <= 0 ? 0 : prev - 1;
        });
        return;
      }

      if (event.key === 'Enter' && activeIndex !== null) {
        event.preventDefault();
        const item = suggestionItems[activeIndex];
        if (!item) return;
        router.push(`${productBasePath}/${item.slug}`);
        handleSuggestionSelect();
      }
    },
    [activeIndex, closePanel, handleSuggestionSelect, isOpen, productBasePath, router, suggestionItems],
  );

  const handleBrandSelect = useCallback(
    (slug?: string) => {
      const target = slug ? `${brandsPath}/${slug}` : brandsPath;
      router.push(target);
    },
    [brandsPath, router],
  );

  const handleBrandMenuSelect = useCallback(
    (event: Event, slug?: string) => {
      event.preventDefault();
      handleBrandSelect(slug);
    },
    [handleBrandSelect],
  );

  return (
    <div className="hidden lg:flex flex-1 min-w-0 justify-center">
      <div ref={containerRef} className="relative w-full max-w-2xl lg:max-w-3xl">
        <form className="flex" onSubmit={handleSubmit}>
          <div className="flex h-12 w-full items-center rounded-xl border-2 border-primary bg-background px-1.5 gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="-mx-1 flex h-10 items-center gap-2 rounded-lg bg-muted px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors focus:outline-none shrink-0"
                >
                  <span className="hidden lg:inline">{BRAND_LABEL_FULL}</span>
                  <span className="lg:hidden">{BRAND_LABEL_SHORT}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" collisionPadding={16} className="header-brand-dropdown overflow-auto p-2 scrollbar-themed">
                <DropdownMenuItem onSelect={(event) => handleBrandMenuSelect(event)} className="font-medium">
                  {ALL_BRANDS_LABEL}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="header-brand-grid">
                  {brandOptions.map((brand) => (
                    <DropdownMenuItem
                      key={brand.slug}
                      onSelect={(event) => handleBrandMenuSelect(event, brand.slug)}
                      className="py-2"
                    >
                      <BrandLogo
                        name={brand.name}
                        src={brand.logoSrc}
                        size="sm"
                        className="rounded-md"
                        imgClassName="w-8 h-8"
                      />
                      <span className="min-w-0 truncate">{brand.name}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Input
              placeholder={SEARCH_PLACEHOLDER}
              value={value}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-expanded={isOpen}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeDescendantId}
              className="h-full flex-1 border-0 rounded-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <Button
              type="submit"
              size="icon"
              className="-mx-1 h-10 w-14 rounded-lg bg-primary hover:bg-primary-dark text-white shrink-0"
              aria-label={SEARCH_LABEL}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">{SEARCH_LABEL}</span>
            </Button>
          </div>
        </form>

        <div
          className={cn(
            'absolute left-0 mt-2 rounded-xl border border-border bg-popover shadow-lg dropdown-content transition-all duration-150 ease-out',
            'w-full min-w-72 lg:min-w-96 max-w-[calc(100vw-2rem)]',
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none',
          )}
          data-state={isOpen ? 'open' : 'closed'}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <ScrollArea className="max-h-[calc(100vh-10rem)] scrollbar-themed">
            <div id={listboxId} role="listbox" className="py-2">
              {showLoading && (
                <div className="px-3 py-2 space-y-3">
                  {Array.from({ length: SUGGESTION_SKELETON_COUNT }).map((_, index) => (
                    <div key={index} className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              )}

              {showHint && <PanelMessage>{MIN_QUERY_HINT}</PanelMessage>}
              {showEmpty && <PanelMessage>{SEARCH_NOT_FOUND_LABEL}</PanelMessage>}

              {suggestionItems.length > 0 && (
                <div className="flex flex-col gap-1">
                  {suggestionItems.map((item, index) => (
                    <SuggestionRow
                      key={item.id}
                      id={`${listboxId}-item-${index}`}
                      href={`${productBasePath}/${item.slug}`}
                      item={item}
                      isActive={index === activeIndex}
                      onHover={() => setActiveIndex(index)}
                      onSelect={handleSuggestionSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {showResultsAction && (
            <div className="border-t border-border px-2 py-1">
              <Button type="button" variant="ghost" className="w-full justify-between gap-2 flex-wrap sm:flex-nowrap" onClick={handleViewAll}>
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4 shrink-0" />
                  <span className="truncate">{SEARCH_RESULTS_LABEL}</span>
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {totalResults}
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
