'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, Search, User, ChevronDown } from 'lucide-react';
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

export function Header() {
  const { user, isAuthenticated, logout, isManager } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
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

            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className={cn('hidden md:flex items-center transition-all', isSearchOpen ? 'w-64' : 'w-0')}>
              {isSearchOpen && (
                <Input placeholder="Поиск товаров..." className="h-9" autoFocus onBlur={() => setIsSearchOpen(false)} />
              )}
            </div>

            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-5 w-5" />
            </Button>

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

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetTitle className="sr-only">Меню навигации</SheetTitle>
                <div className="flex flex-col gap-6 pt-6">
                  <Input placeholder="Поиск товаров..." className="h-10" />

                  <nav className="flex flex-col gap-1">
                    {NAV_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="px-4 py-3 text-base font-medium rounded-md transition-colors hover:bg-muted"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

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
