'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Menu, Search, User, ChevronDown, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth/auth-context';
import { useBrands } from '@/lib/hooks/use-brands';
import { BRANDS } from '@/data/brands';
import { BrandLogo } from '@/components/brands/brand-logo';
import { cn } from '@/lib/utils';
import { SITE_CONTACTS } from '@/lib/site-contacts';
import { getCartItemsCount, useCartStore } from '@/lib/cart';

const NAV_ITEMS = [
  { label: 'Бренды', href: '/brands' },
  { label: 'О компании', href: '/#about' },
  { label: 'Контакты', href: '/contacts' },
];

const CATALOG_PATH = '/catalog';
const BRANDS_PATH = '/brands';
const REQUEST_PATH = '/request';
const SORT_LOCALE = 'ru';
const SEARCH_PARAM = 'search';
const PAGE_PARAM = 'page';
const FIRST_PAGE = '1';

type HeaderBrandOption = { name: string; slug: string; logoSrc?: string | null };

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
  const { data: apiBrands } = useBrands();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const cartCount = useCartStore((state) => getCartItemsCount(state.items));
  const cartBadge = cartCount > 99 ? '99+' : `${cartCount}`;

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
      a.name.localeCompare(b.name, SORT_LOCALE, { sensitivity: 'base' })
    );
  }, [apiBrands]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const urlValue = params.get(SEARCH_PARAM) || '';
    setSearchValue(pathname === CATALOG_PATH ? urlValue : '');
  }, [pathname]);

  const runSearch = (opts?: { closeMobileMenu?: boolean }) => {
    const currentSearch = typeof window === 'undefined' ? null : window.location.search;
    const href = buildCatalogSearchHref({
      searchValue,
      currentSearch,
      keepExistingParams: pathname === CATALOG_PATH,
    });
    router.push(href);
    if (opts?.closeMobileMenu) setIsMobileMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-50 w-full">
      <div className="w-full border-b border-border bg-background">
        <div className="container-custom">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-2 text-xs text-muted-foreground">
            <HeaderNavLinks
              className="hidden md:flex items-center gap-4"
              linkClassName="hover:text-foreground transition-colors"
            />

            <div className="ml-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
              <a
                href={`tel:${SITE_CONTACTS.phones.telegram.tel}`}
                className="hover:text-foreground transition-colors whitespace-nowrap"
              >
                {SITE_CONTACTS.phones.telegram.display} — {SITE_CONTACTS.phones.telegram.title}
              </a>
              <a
                href={`tel:${SITE_CONTACTS.phones.office.tel}`}
                className="hover:text-foreground transition-colors whitespace-nowrap"
              >
                {SITE_CONTACTS.phones.office.display} — {SITE_CONTACTS.phones.office.title}
              </a>
              <a
                href={SITE_CONTACTS.email.mailto}
                className="hover:text-foreground transition-colors whitespace-nowrap"
              >
                {SITE_CONTACTS.email.display}
              </a>
            </div>
          </div>
        </div>
      </div>

      <header className="w-full border-b border-border bg-background">
        <div className="container-custom">
          <div className="flex h-20 items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/ponatech-logo-rectangular.webp"
                alt="Pona Tech"
                width={160}
                height={48}
                className="h-10 w-auto sm:h-12 logo-primary"
                priority
              />
            </Link>

            <Button asChild size="lg" className="hidden sm:inline-flex h-12 px-6 text-base">
              <Link href={CATALOG_PATH}>
                <LayoutGrid className="h-5 w-5" />
                Каталог
              </Link>
            </Button>
          </div>

          <form
            className="hidden md:flex flex-1 min-w-0 justify-center"
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
          >
            <div className="flex h-12 w-full max-w-2xl lg:max-w-3xl items-center rounded-xl border-2 border-primary bg-background px-1.5 gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="-mx-[3px] flex h-10 items-center gap-2 rounded-lg bg-[#eff3f6] px-4 text-sm font-medium text-foreground hover:bg-[#e4e9f0] transition-colors focus:outline-none shrink-0"
                  >
                    <span className="hidden lg:inline">Бренды</span>
                    <span className="lg:hidden">Бренд</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" collisionPadding={16} className="header-brand-dropdown overflow-auto p-2 scrollbar-themed">
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      router.push(BRANDS_PATH);
                    }}
                    className="font-medium"
                  >
                    Все бренды
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="header-brand-grid">
                    {brandOptions.map((brand) => (
                      <DropdownMenuItem
                        key={brand.slug}
                        onSelect={(e) => {
                          e.preventDefault();
                          router.push(`${BRANDS_PATH}/${brand.slug}`);
                        }}
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
                placeholder="Искать на PonaTech..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className={cn(
                  'h-full flex-1 border-0 rounded-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
                )}
              />

              <Button
                type="submit"
                size="icon"
                className="-mx-[3px] h-10 w-14 rounded-lg bg-primary hover:bg-primary-dark text-white shrink-0"
                aria-label="Поиск"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 px-2">
                    <User className="h-5 w-5" />
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="max-w-full truncate">
                    {user?.email ?? 'Профиль'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
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
                <Button variant="ghost" asChild className="h-12">
                  <Link href="/login">Войти</Link>
                </Button>
                <Button asChild className="h-12">
                  <Link href="/register">Регистрация</Link>
                </Button>
              </div>
            )}

            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart" aria-label="Корзина">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center">
                    {cartBadge}
                  </span>
                )}
              </Link>
            </Button>

            <Button variant="secondary" asChild className="hidden md:flex h-12">
              <Link href={REQUEST_PATH}>Оставить заявку</Link>
            </Button>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80">
                <SheetTitle className="sr-only">Меню навигации</SheetTitle>
                <div className="flex flex-col gap-6 pt-6">
                  <Button asChild className="w-full">
                    <Link href={CATALOG_PATH}>
                      <LayoutGrid />
                      Каталог
                    </Link>
                  </Button>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      runSearch({ closeMobileMenu: true });
                    }}
                  >
                    <Input
                      placeholder="Искать на PonaTech..."
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

                  <Button
                    variant="outline"
                    asChild
                    className="w-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link href="/cart">
                      {cartCount > 0 ? `Корзина (${cartBadge})` : 'Корзина'}
                    </Link>
                  </Button>

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
    </div>
  );
}
