'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type DebouncedSearchParamsOptions = {
  basePath: string;
  searchKey: string;
  pageKey: string;
  defaultPage: number;
  delayMs: number;
};

type DebouncedSearchParamsResult = {
  searchInput: string;
  setSearchInput: (value: string) => void;
  searchQuery: string;
  buildUrlWithParams: (updates: Record<string, string | number | undefined | null>) => string;
};

export function useDebouncedSearchParams({
  basePath,
  searchKey,
  pageKey,
  defaultPage,
  delayMs,
}: DebouncedSearchParamsOptions): DebouncedSearchParamsResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamValue = useMemo(() => searchParams.get(searchKey) ?? '', [searchParams, searchKey]);
  const searchParamsString = useMemo(() => searchParams.toString(), [searchParams]);

  const [searchInput, setSearchInput] = useState(searchParamValue);
  const [searchQuery, setSearchQuery] = useState(searchParamValue);

  useEffect(() => {
    if (searchParamValue === searchInput && searchParamValue === searchQuery) return;
    setSearchInput(searchParamValue);
    setSearchQuery(searchParamValue);
  }, [searchParamValue, searchInput, searchQuery]);

  const buildUrlWithParams = useMemo(() => {
    return (updates: Record<string, string | number | undefined | null>) => {
      const next = new URLSearchParams(searchParamsString);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          next.delete(key);
          return;
        }
        next.set(key, String(value));
      });
      const query = next.toString();
      return `${basePath}${query ? `?${query}` : ''}`;
    };
  }, [searchParamsString, basePath]);

  useEffect(() => {
    const next = searchInput.trim();
    if (next === searchQuery) return;
    const timeout = setTimeout(() => {
      setSearchQuery(next);
      router.replace(buildUrlWithParams({ [searchKey]: next || undefined, [pageKey]: defaultPage }));
    }, delayMs);
    return () => {
      clearTimeout(timeout);
    };
  }, [searchInput, searchQuery, router, buildUrlWithParams, searchKey, pageKey, defaultPage, delayMs]);

  return { searchInput, setSearchInput, searchQuery, buildUrlWithParams };
}
