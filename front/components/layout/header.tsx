'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth/auth-context';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Бренды', href: '/brands' },
  { label: 'О компании', href: '/#about' },
  { label: 'Контакты', href: '/contacts' },
];

const CATALOG_PATH = '/catalog';
const SEARCH_PARAM = 'search';
const PAGE_PARAM = 'page';
const FIRST_PAGE = '1';

function buildCatalogSearchHref(args: {
  searchValue: string;
  currentSearch: string | null;
  keepExistingParams: boolean;
}) {
  const { searchValue, currentSearch, keepExistingParams } = args;

  const trimmed = searchValue.trim();
  const params = keepExistingParams ? new URLSearchParams(currentSearch || '') : new URLSearchParams();

  if (trimmed) {
    params.set(SEARCH_PARAM, trimmed);
  } else {
    params.delete(SEARCH_PARAM);
  }

  params.set(PAGE_PARAM, FIRST_PAGE);
  const query = params.toString();
  return query ? `${CATALOG_PATH}?${query}` : CATALOG_PATH;
}

function HeaderNavLinks(props: {
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
}) {
  const { className, linkClassName, onNavigate } = props;

  return (
    <nav className={className}>
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} className={linkClassName} onClick={onNavigate}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const { user, isAuthenticated, logout, isManager } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSearchOpen) return;
    searchInputRef.current?.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) return;
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const urlValue = params.get(SEARCH_PARAM) || '';
    setSearchValue(pathname === CATALOG_PATH ? urlValue : '');
  }, [pathname, isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (searchAreaRef.current?.contains(target)) return;
      setIsSearchOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isSearchOpen]);

  const runSearch = (opts?: { closeMobileMenu?: boolean }) => {
    const currentSearch = typeof window === 'undefined' ? null : window.location.search;
    const href = buildCatalogSearchHref({
      searchValue,
      currentSearch,
      keepExistingParams: pathname === CATALOG_PATH,
    });
    router.push(href);
    setIsSearchOpen(false);
    if (opts?.closeMobileMenu) setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom">
        <div className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/ponatech-logo-rectangular.PNG"
                alt="Pona Tech"
                width={140}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          <div className="hidden lg:flex min-w-0 items-center justify-center gap-1">
            <HeaderNavLinks
              className="flex items-center gap-1"
              linkClassName="px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary whitespace-nowrap"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div ref={searchAreaRef} className="hidden md:flex items-center gap-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  runSearch();
                }}
              >
                <div
                  className={cn(
                    'flex items-center overflow-hidden transition-[width] duration-300 ease-in-out',
                    isSearchOpen ? 'w-64' : 'w-0',
                  )}
                >
                  <Input
                    ref={searchInputRef}
                    placeholder="Поиск товаров..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setIsSearchOpen(false);
                    }}
                    className={cn('h-9 transition-opacity duration-200', isSearchOpen ? 'opacity-100' : 'opacity-0')}
                    tabIndex={isSearchOpen ? 0 : -1}
                    disabled={!isSearchOpen}
                  />
                </div>
              </form>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsSearchOpen((v) => !v);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">{user?.email?.split('@')[0]}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Профиль</Link>
                  </DropdownMenuItem>
                  {isManager && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard">Админ-панель</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Войти</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Регистрация</Link>
                </Button>
              </div>
            )}

            <Button variant="secondary" asChild className="hidden md:flex">
              <Link href="/request">Оставить заявку</Link>
            </Button>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetTitle className="sr-only">Меню навигации</SheetTitle>
                <div className="flex flex-col gap-6 pt-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      runSearch({ closeMobileMenu: true });
                    }}
                  >
                    <Input
                      placeholder="Поиск товаров..."
                      className="h-10"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                  </form>

                  <HeaderNavLinks
                    className="flex flex-col gap-1"
                    linkClassName="px-4 py-3 text-base font-medium rounded-md transition-colors hover:bg-muted"
                    onNavigate={() => setIsMobileMenuOpen(false)}
                  />

                  <div className="flex flex-col gap-2 pt-4 border-t">
                    {isAuthenticated ? (
                      <>
                        <Button variant="outline" asChild className="w-full">
                          <Link href="/profile">Профиль</Link>
                        </Button>
                        {isManager && (
                          <Button variant="outline" asChild className="w-full">
                            <Link href="/admin/dashboard">Админ-панель</Link>
                          </Button>
                        )}
                        <Button variant="ghost" onClick={logout} className="w-full text-destructive">
                          Выйти
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" asChild className="w-full">
                          <Link href="/login">Войти</Link>
                        </Button>
                        <Button asChild className="w-full">
                          <Link href="/register">Регистрация</Link>
                        </Button>
                      </>
                    )}
                  </div>

                  <Button variant="secondary" asChild className="w-full">
                    <Link href="/request">Оставить заявку</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
