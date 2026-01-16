'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, Send, ShoppingCart, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductCard } from '@/components/catalog';
import { getCartItemsCount, useCartStore } from '@/lib/cart';
import { useProducts } from '@/lib/hooks/use-products';
import { formatPrice } from '@/lib/utils';

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  );
}

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);

  const cartItemIds = useMemo(() => new Set(items.map((item) => item.id)), [items]);
  const primaryCategoryId = useMemo(() => {
    const categoryIds = items.map((item) => item.categoryId).filter(Boolean);
    return categoryIds[0];
  }, [items]);

  const { data: productsPage, isLoading: isProductsLoading } = useProducts({ limit: 4, status: 'PUBLISHED' });
  const popularProducts = productsPage?.data ?? [];

  const { data: similarProductsPage, isLoading: isSimilarLoading } = useProducts({
    categoryId: primaryCategoryId,
    limit: 8,
    status: 'PUBLISHED',
  });

  const similarProducts = useMemo(() => {
    const products = similarProductsPage?.data ?? [];
    return products.filter((p) => !cartItemIds.has(p.id)).slice(0, 4);
  }, [similarProductsPage, cartItemIds]);

  const totalItems = useMemo(() => getCartItemsCount(items), [items]);
  const totals = useMemo(() => {
    const sum = items.reduce((acc, item) => {
      const price = Number(item.price);
      return Number.isFinite(price) ? acc + price * item.quantity : acc;
    }, 0);
    const hasPrice = items.some((item) => Number.isFinite(Number(item.price)));
    return { sum, hasPrice, currency: items[0]?.currency ?? 'RUB' };
  }, [items]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-6 sm:py-8 lg:py-12">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Корзина</h1>
              <p className="text-sm text-muted-foreground">
                {totalItems > 0 ? `Товаров в корзине: ${totalItems}` : 'Добавьте товары из каталога'}
              </p>
            </div>
            {items.length > 0 && (
              <Button variant="ghost" onClick={clear}>
                <Trash2 className="h-4 w-4" />
                Очистить корзину
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <>
              <Card>
                <CardContent className="py-12 flex flex-col items-center text-center gap-3">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Корзина пуста</h2>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Добавьте товары, чтобы сформировать список для запроса. Он автоматически попадёт в форму.
                  </p>
                  <Button asChild>
                    <Link href="/catalog">Перейти в каталог</Link>
                  </Button>
                </CardContent>
              </Card>

              <section className="mt-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Популярные товары</h2>
                    <p className="text-sm text-muted-foreground">Возможно, вас заинтересуют эти позиции</p>
                  </div>
                  <Button variant="outline" asChild size="sm">
                    <Link href="/catalog">
                      Весь каталог
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {isProductsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                ) : popularProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {popularProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : null}
              </section>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Список товаров</CardTitle>
                    <CardDescription>Корзина формирует перечень, который будет добавлен в заявку.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Товар</TableHead>
                          <TableHead className="hidden sm:table-cell">SKU</TableHead>
                          <TableHead>Количество</TableHead>
                          <TableHead className="hidden md:table-cell">Цена</TableHead>
                          <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="min-w-0">
                                <Link
                                  href={`/catalog/${item.slug}`}
                                  className="font-medium hover:text-primary transition-colors line-clamp-2"
                                >
                                  {item.title}
                                </Link>
                                {item.brandName && (
                                  <p className="text-xs text-muted-foreground mt-1">Бренд: {item.brandName}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                              {item.sku}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  type="button"
                                  disabled={item.quantity <= 1}
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="min-w-[28px] text-center text-sm font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm">
                              {Number.isFinite(Number(item.price))
                                ? formatPrice(Number(item.price), item.currency)
                                : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                                <Trash2 className="h-4 w-4" />
                                Удалить
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle>Дальше по заявке</CardTitle>
                    <CardDescription>
                      Список из корзины автоматически подставится в форму запроса. Останется заполнить контактные данные.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Позиций</span>
                      <span className="font-medium">{totalItems}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Сумма</span>
                      <span className="font-medium">
                        {totals.hasPrice ? formatPrice(totals.sum, totals.currency) : '—'}
                      </span>
                    </div>
                    <Button asChild size="lg" className="w-full">
                      <Link href="/request">
                        <Send className="h-4 w-4" />
                        Оформить запрос
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/catalog">Продолжить выбор</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <section className="mt-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">
                      {primaryCategoryId ? 'Похожие товары' : 'Вам может понравиться'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {primaryCategoryId ? 'Товары из той же категории' : 'Популярные позиции из каталога'}
                    </p>
                  </div>
                  <Button variant="outline" asChild size="sm">
                    <Link href="/catalog">
                      Весь каталог
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {(primaryCategoryId ? isSimilarLoading : isProductsLoading) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                ) : (primaryCategoryId ? similarProducts : popularProducts.filter((p) => !cartItemIds.has(p.id)).slice(0, 4)).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {(primaryCategoryId ? similarProducts : popularProducts.filter((p) => !cartItemIds.has(p.id)).slice(0, 4)).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : null}
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
