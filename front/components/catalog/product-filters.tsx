'use client';

import { useEffect, useState } from 'react';
import { PanelLeftClose, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  FilterContent,
  FILTER_ACTIVE_QUERY_KEYS,
  FILTER_MULTI_VALUE_KEYS,
  FILTER_VALUE_SEPARATOR,
} from '@/components/catalog/product-filters-content';

interface ProductFiltersProps {
  compact?: boolean;
}

const FILTERS_TITLE = 'Фильтры';
const FILTERS_COLLAPSE_LABEL = 'Свернуть фильтры';
const FILTERS_EXPAND_LABEL = 'Развернуть фильтры';
const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';
const FILTER_PANEL_STORAGE_KEY = 'catalog-filters-collapsed';
const STORAGE_VALUE_ENABLED = '1';
const STORAGE_VALUE_DISABLED = '0';
const FILTER_PANEL_BASE_CLASS = 'sticky bg-background rounded-xl border border-border';
const FILTER_PANEL_TITLE_CLASS = 'font-semibold';
const FILTER_PANEL_TITLE_WRAPPER_CLASS = 'flex items-center gap-2';
const FILTER_PANEL_HEADER_CLASS = 'flex items-center justify-between';
const FILTER_PANEL_WRAPPER_CLASS = 'flex-shrink-0';
const FILTER_PANEL_EXPANDED_WRAPPER_CLASS = 'w-64';
const FILTER_PANEL_EXPANDED_PADDING_CLASS = 'p-4';
const FILTER_PANEL_EXPANDED_HEADER_MARGIN_CLASS = 'mb-4';
const FILTER_PANEL_STICKY_CLASS = 'catalog-filters-sticky';
const FILTER_PANEL_FLOATING_BUTTON_CLASS = 'relative shadow-md';
const FILTER_PANEL_FLOATING_BADGE_CLASS =
  'absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center';
const FILTER_PANEL_TOGGLE_CLASS = 'shrink-0';
const FILTER_PANEL_ICON_CLASS = 'h-4 w-4';
const FILTER_PANEL_COLLAPSED_WRAPPER_CLASS = 'w-12';
const FILTER_PANEL_COLLAPSED_CONTAINER_CLASS = 'sticky';
const FILTER_PANEL_COLLAPSED_CONTENT_CLASS = 'flex justify-center';
const WINDOW_UNDEFINED = 'undefined';
const FILTER_BADGE_MAX = 99;
const FILTER_BADGE_MAX_LABEL = '99+';

const canUseStorage = () => typeof window !== WINDOW_UNDEFINED;

const readCollapsedStorage = () => {
  if (!canUseStorage()) return null;
  const stored = window.localStorage.getItem(FILTER_PANEL_STORAGE_KEY);
  if (stored === STORAGE_VALUE_ENABLED) return true;
  if (stored === STORAGE_VALUE_DISABLED) return false;
  return null;
};

const writeCollapsedStorage = (value: boolean) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(FILTER_PANEL_STORAGE_KEY, value ? STORAGE_VALUE_ENABLED : STORAGE_VALUE_DISABLED);
};

const MULTI_VALUE_KEYS = new Set<string>(FILTER_MULTI_VALUE_KEYS);

const countActiveFilters = (params: ReadonlyURLSearchParams) => {
  return FILTER_ACTIVE_QUERY_KEYS.reduce((acc, key) => {
    const value = params.get(key);
    if (!value) return acc;
    if (MULTI_VALUE_KEYS.has(key)) {
      return acc + value.split(FILTER_VALUE_SEPARATOR).filter(Boolean).length;
    }
    return acc + 1;
  }, 0);
};

export function ProductFilters({ compact = false }: ProductFiltersProps) {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(compact);
  const activeFiltersCount = countActiveFilters(searchParams);
  const activeFiltersLabel =
    activeFiltersCount > FILTER_BADGE_MAX ? FILTER_BADGE_MAX_LABEL : `${activeFiltersCount}`;

  useEffect(() => {
    if (!isDesktop) return;
    const stored = readCollapsedStorage();
    setIsCollapsed(stored ?? compact);
  }, [compact, isDesktop]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      writeCollapsedStorage(next);
      return next;
    });
  };

  if (!isDesktop) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
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

  if (isCollapsed) {
    return (
      <div className={cn(FILTER_PANEL_WRAPPER_CLASS, FILTER_PANEL_COLLAPSED_WRAPPER_CLASS)}>
        <div className={cn(FILTER_PANEL_COLLAPSED_CONTAINER_CLASS, FILTER_PANEL_STICKY_CLASS, FILTER_PANEL_COLLAPSED_CONTENT_CLASS)}>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleCollapsed}
            aria-label={FILTERS_EXPAND_LABEL}
            className={FILTER_PANEL_FLOATING_BUTTON_CLASS}
          >
            <SlidersHorizontal className={FILTER_PANEL_ICON_CLASS} />
            {activeFiltersCount > 0 && <span className={FILTER_PANEL_FLOATING_BADGE_CLASS}>{activeFiltersLabel}</span>}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(FILTER_PANEL_WRAPPER_CLASS, FILTER_PANEL_EXPANDED_WRAPPER_CLASS)}>
      <div className={cn(FILTER_PANEL_BASE_CLASS, FILTER_PANEL_STICKY_CLASS, FILTER_PANEL_EXPANDED_PADDING_CLASS)}>
        <div className={cn(FILTER_PANEL_HEADER_CLASS, FILTER_PANEL_EXPANDED_HEADER_MARGIN_CLASS)}>
          <div className={FILTER_PANEL_TITLE_WRAPPER_CLASS}>
            <SlidersHorizontal className={FILTER_PANEL_ICON_CLASS} />
            <h3 className={FILTER_PANEL_TITLE_CLASS}>{FILTERS_TITLE}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            aria-label={FILTERS_COLLAPSE_LABEL}
            className={FILTER_PANEL_TOGGLE_CLASS}
          >
            <PanelLeftClose className={FILTER_PANEL_ICON_CLASS} />
          </Button>
        </div>
        <FilterContent />
      </div>
    </div>
  );
}
