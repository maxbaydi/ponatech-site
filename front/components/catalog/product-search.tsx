'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { debounce } from '@/lib/utils';

const CLEAR_SEARCH_LABEL = 'Очистить поиск';

export function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('search') || '');
  const isUserTyping = useRef(false);

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const updateSearch = useCallback(
    debounce((searchValue: string) => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (searchValue) {
        params.set('search', searchValue);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.push(`/catalog?${params.toString()}`, { scroll: false });
      isUserTyping.current = false;
    }, 500),
    [router]
  );

  useEffect(() => {
    if (isUserTyping.current) {
      updateSearch(value);
    }
  }, [value, updateSearch]);

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (!isUserTyping.current && urlSearch !== value) {
      setValue(urlSearch);
    }
  }, [searchParams]);

  const handleChange = (newValue: string) => {
    isUserTyping.current = true;
    setValue(newValue);
  };

  const clearSearch = () => {
    isUserTyping.current = true;
    setValue('');
  };

  return (
    <div className="relative w-full sm:max-w-md flex-1 min-w-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Поиск по названию или SKU..."
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-10 pr-10"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={clearSearch}
          aria-label={CLEAR_SEARCH_LABEL}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
