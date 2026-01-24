'use client';

import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Loader2, Minus, Package, Plus, Send, ShoppingCart, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductCard } from '@/components/catalog';
import { getCartItemsCount, useCartStore } from '@/lib/cart';
import { useCartRecommendations } from '@/lib/hooks/use-cart-recommendations';
import { useProducts } from '@/lib/hooks/use-products';
import { formatPrice } from '@/lib/utils';
import { useDisplayCurrency } from '@/lib/hooks/use-site-settings';
import type { Product, ProductStatus } from '@/lib/api/types';

const RECOMMENDATIONS_LIMIT = 4;
const POPULAR_PRODUCTS_LIMIT = 12;
const PRODUCT_GRID_CLASSNAME = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6';
const PRODUCT_STATUS_PUBLISHED: ProductStatus = 'PUBLISHED';
const RECOMMENDATION_SKELETONS = Array.from({ length: RECOMMENDATIONS_LIMIT });
const CART_ITEM_IMAGE_SIZE = 48;
const CART_ITEM_IMAGE_SIZES = `${CART_ITEM_IMAGE_SIZE}px`;
const CART_ITEM_IMAGE_WRAPPER_CLASS = 'h-12 w-12 rounded-md border border-border bg-background flex items-center justify-center overflow-hidden';
const CART_ITEM_IMAGE_CLASS = 'h-12 w-12 object-contain';
const CART_ITEM_IMAGE_ICON_CLASS = 'h-5 w-5 text-muted-foreground';
const CLEAR_CART_LABEL = 'Очистить корзину';
const CLEAR_CART_TITLE = 'Очистить корзину?';
const CLEAR_CART_DESCRIPTION = 'Все товары будут удалены из корзины.';
const CLEAR_CART_CONFIRM_LABEL = 'Очистить';
const REMOVE_ITEM_TITLE = 'Удалить товар?';
const REMOVE_ITEM_CONFIRM_LABEL = 'Удалить';
const REMOVE_ITEM_LABEL = 'Удалить товар';
const REMOVE_ITEM_TEXT = 'Удалить';
const CANCEL_LABEL = 'Отмена';
const CART_ERROR_TITLE = 'Не удалось обновить корзину';
const RETRY_LABEL = 'Повторить';
const RECOMMENDATIONS_ERROR_MESSAGE = 'Не удалось загрузить рекомендации';
const POPULAR_PRODUCTS_ERROR_MESSAGE = 'Не удалось загрузить популярные товары';
const QUANTITY_DECREASE_LABEL = 'Уменьшить количество';
const QUANTITY_INCREASE_LABEL = 'Увеличить количество';
const QUANTITY_ICON_CLASS = 'h-3 w-3';
const LOADER_ICON_CLASS = 'h-3 w-3 animate-spin';
const CONFIRM_LOADER_ICON_CLASS = 'mr-2 h-4 w-4 animate-spin';

type ConfirmAction = { type: 'clear' } | { type: 'remove'; itemId: string; itemTitle: string };
type PendingAction = { type: 'clear' } | { type: 'remove' | 'update'; itemId: string };

const buildRemoveDescription = (title: string) => `Удалить "${title}" из корзины?`;

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

function ProductsGrid({ products }: { products: Product[] }) {
  return (
    <div className={PRODUCT_GRID_CLASSNAME}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductsGridSkeleton() {
  return (
    <div className={PRODUCT_GRID_CLASSNAME}>
      {RECOMMENDATION_SKELETONS.map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

interface SectionErrorProps {
  message: string;
  onRetry: () => void;
}

function SectionError({ message, onRetry }: SectionErrorProps) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-destructive mb-3">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        {RETRY_LABEL}
      </Button>
    </div>
  );
}

interface QuantityButtonProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
  isPending: boolean;
  className: string;
  icon: typeof Minus;
}

function QuantityButton({ label, onClick, disabled, isPending, className, icon: Icon }: QuantityButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={className}
      onClick={onClick}
      disabled={disabled || isPending}
      aria-label={label}
      title={label}
    >
      {isPending ? <Loader2 className={LOADER_ICON_CLASS} /> : <Icon className={QUANTITY_ICON_CLASS} />}
    </Button>
  );
}

interface QuantityControlsProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  isPending: boolean;
  isDisabled: boolean;
  buttonClassName: string;
}

function QuantityControls({
  quantity,
  onDecrease,
  onIncrease,
  isPending,
  isDisabled,
  buttonClassName,
}: QuantityControlsProps) {
  const isDecreaseDisabled = quantity <= 1 || isPending || isDisabled;

  return (
    <div className="flex items-center gap-1">
      <QuantityButton
        label={QUANTITY_DECREASE_LABEL}
        onClick={onDecrease}
        disabled={isDecreaseDisabled}
        isPending={isPending}
        className={buttonClassName}
        icon={Minus}
      />
      <span className="min-w-6 text-center text-sm font-medium">{quantity}</span>
      <QuantityButton
        label={QUANTITY_INCREASE_LABEL}
        onClick={onIncrease}
        disabled={isDisabled || isPending}
        isPending={isPending}
        className={buttonClassName}
        icon={Plus}
      />
    </div>
  );
}

interface RemoveItemButtonProps {
  onClick: () => void;
  disabled: boolean;
  className?: string;
  size: 'icon' | 'sm';
  showLabel?: boolean;
}

function RemoveItemButton({ onClick, disabled, className, size, showLabel }: RemoveItemButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-label={REMOVE_ITEM_LABEL}
    >
      <Trash2 className="h-4 w-4" />
      {showLabel && <span>{REMOVE_ITEM_TEXT}</span>}
    </Button>
  );
}

function CatalogLinkButton() {
  return (
    <Button variant="outline" asChild size="sm">
      <Link href="/catalog">
        Весь каталог
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const isCartLoading = useCartStore((state) => state.isLoading);
  const cartError = useCartStore((state) => state.error);
  const displayCurrency = useDisplayCurrency();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const hasItems = items.length > 0;
  const cartItemIds = useMemo(() => new Set(items.map((item) => String(item.id))), [items]);
  const hasCategoryInCart = useMemo(() => items.some((item) => Boolean(item.categoryId)), [items]);

  const {
    data: productsPage,
    isLoading: isProductsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts({
    limit: POPULAR_PRODUCTS_LIMIT,
    status: PRODUCT_STATUS_PUBLISHED,
  });
  const popularProducts = productsPage?.data ?? [];

  const {
    data: recommendationsData,
    isLoading: isRecommendationsLoading,
    error: recommendationsError,
    refetch: refetchRecommendations,
  } = useCartRecommendations({ limit: RECOMMENDATIONS_LIMIT }, { enabled: hasItems });

  const recommendations = useMemo(() => {
    const products = recommendationsData?.items ?? [];
    return products.filter((product) => !cartItemIds.has(String(product.id)));
  }, [recommendationsData, cartItemIds]);

  const filteredPopularProducts = useMemo(
    () => popularProducts.filter((product) => !cartItemIds.has(String(product.id))),
    [popularProducts, cartItemIds],
  );

  const popularProductsPreview = useMemo(
    () => filteredPopularProducts.slice(0, RECOMMENDATIONS_LIMIT),
    [filteredPopularProducts],
  );

  const recommendedProducts = useMemo(() => {
    if (!hasItems) {
      return popularProductsPreview;
    }
    if (recommendations.length >= RECOMMENDATIONS_LIMIT) {
      return recommendations.slice(0, RECOMMENDATIONS_LIMIT);
    }
    const existingIds = new Set(recommendations.map((product) => String(product.id)));
    const fill = filteredPopularProducts
      .filter((product) => !existingIds.has(String(product.id)))
      .slice(0, RECOMMENDATIONS_LIMIT - recommendations.length);
    return [...recommendations, ...fill];
  }, [filteredPopularProducts, hasItems, popularProductsPreview, recommendations]);

  const isRecommendationLoading = hasItems
    ? isRecommendationsLoading || (recommendations.length === 0 && isProductsLoading)
    : isProductsLoading;
  const hasProductsError = Boolean(productsError);
  const hasRecommendationsError = Boolean(recommendationsError);
  const showPopularError = !hasItems && hasProductsError && popularProductsPreview.length === 0;
  const showRecommendationsError = hasItems && hasRecommendationsError && recommendedProducts.length === 0;
  const isCartBusy = isCartLoading || pendingAction !== null;

  const handleAction = useCallback(
    async (action: PendingAction, task: () => Promise<void>) => {
      if (isCartLoading || pendingAction) return;
      setPendingAction(action);
      try {
        await task();
      } finally {
        setPendingAction(null);
      }
    },
    [isCartLoading, pendingAction],
  );

  const handleQuantityChange = useCallback(
    (itemId: string, nextQuantity: number) => {
      void handleAction({ type: 'update', itemId }, () => updateQuantity(itemId, nextQuantity));
    },
    [handleAction, updateQuantity],
  );

  const handleClearRequest = useCallback(() => {
    setConfirmAction({ type: 'clear' });
  }, []);

  const handleRemoveRequest = useCallback((itemId: string, itemTitle: string) => {
    setConfirmAction({ type: 'remove', itemId, itemTitle });
  }, []);

  const handleConfirmOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setConfirmAction(null);
    }
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'clear') {
      await handleAction({ type: 'clear' }, clear);
    } else {
      await handleAction({ type: 'remove', itemId: confirmAction.itemId }, () => removeItem(confirmAction.itemId));
    }
    setConfirmAction(null);
  }, [clear, confirmAction, handleAction, removeItem]);

  const handleRetryProducts = useCallback(() => {
    refetchProducts();
  }, [refetchProducts]);

  const handleRetryRecommendations = useCallback(() => {
    refetchRecommendations();
  }, [refetchRecommendations]);

  const confirmTitle = confirmAction
    ? confirmAction.type === 'clear'
      ? CLEAR_CART_TITLE
      : REMOVE_ITEM_TITLE
    : '';
  const confirmDescription = confirmAction
    ? confirmAction.type === 'clear'
      ? CLEAR_CART_DESCRIPTION
      : buildRemoveDescription(confirmAction.itemTitle)
    : '';
  const confirmButtonLabel = confirmAction
    ? confirmAction.type === 'clear'
      ? CLEAR_CART_CONFIRM_LABEL
      : REMOVE_ITEM_CONFIRM_LABEL
    : '';
  const confirmPending = pendingAction?.type === 'clear' || pendingAction?.type === 'remove';
  const isUpdatePending = (itemId: string) => pendingAction?.type === 'update' && pendingAction.itemId === itemId;

  const totalItems = useMemo(() => getCartItemsCount(items), [items]);
  const totals = useMemo(() => {
    const sum = items.reduce((acc, item) => {
      const price = Number(item.price);
      return Number.isFinite(price) ? acc + price * item.quantity : acc;
    }, 0);
    const hasPrice = items.some((item) => Number.isFinite(Number(item.price)));
    return { sum, hasPrice };
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
              <Button variant="ghost" onClick={handleClearRequest} disabled={isCartBusy}>
                <Trash2 className="h-4 w-4" />
                {CLEAR_CART_LABEL}
              </Button>
            )}
          </div>
          {cartError && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <p className="font-medium">{CART_ERROR_TITLE}</p>
              <p>{cartError}</p>
            </div>
          )}

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
                  <CatalogLinkButton />
                </div>

                {isProductsLoading ? (
                  <ProductsGridSkeleton />
                ) : showPopularError ? (
                  <SectionError message={POPULAR_PRODUCTS_ERROR_MESSAGE} onRetry={handleRetryProducts} />
                ) : popularProductsPreview.length > 0 ? (
                  <ProductsGrid products={popularProductsPreview} />
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
                  <CardContent className="px-3 sm:px-6">
                    <div className="hidden sm:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-14" />
                            <TableHead>Товар</TableHead>
                            <TableHead className="hidden md:table-cell">SKU</TableHead>
                            <TableHead>Кол-во</TableHead>
                            <TableHead className="hidden lg:table-cell">Цена</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => {
                            const itemUpdatePending = isUpdatePending(item.id);
                            const controlsDisabled = isCartBusy && !itemUpdatePending;

                            return (
                              <TableRow key={item.id}>
                                <TableCell className="p-2">
                                  <div className={CART_ITEM_IMAGE_WRAPPER_CLASS}>
                                    {item.imageUrl ? (
                                      <Image
                                        src={item.imageUrl}
                                        alt={item.imageAlt ?? item.title}
                                        width={CART_ITEM_IMAGE_SIZE}
                                        height={CART_ITEM_IMAGE_SIZE}
                                        sizes={CART_ITEM_IMAGE_SIZES}
                                        className={CART_ITEM_IMAGE_CLASS}
                                        unoptimized
                                      />
                                    ) : (
                                      <Package className={CART_ITEM_IMAGE_ICON_CLASS} />
                                    )}
                                  </div>
                                </TableCell>
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
                                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                                  {item.sku}
                                </TableCell>
                                <TableCell>
                                  <QuantityControls
                                    quantity={item.quantity}
                                    onDecrease={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    onIncrease={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    isPending={itemUpdatePending}
                                    isDisabled={controlsDisabled}
                                    buttonClassName="h-8 w-8"
                                  />
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-sm">
                                  {Number.isFinite(Number(item.price))
                                    ? formatPrice(Number(item.price), displayCurrency)
                                    : '—'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <RemoveItemButton
                                    size="icon"
                                    onClick={() => handleRemoveRequest(item.id, item.title)}
                                    disabled={isCartBusy}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="sm:hidden space-y-3">
                      {items.map((item) => {
                        const itemUpdatePending = isUpdatePending(item.id);
                        const controlsDisabled = isCartBusy && !itemUpdatePending;

                        return (
                          <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                            <div className={CART_ITEM_IMAGE_WRAPPER_CLASS}>
                              {item.imageUrl ? (
                                <Image
                                  src={item.imageUrl}
                                  alt={item.imageAlt ?? item.title}
                                  width={CART_ITEM_IMAGE_SIZE}
                                  height={CART_ITEM_IMAGE_SIZE}
                                  sizes={CART_ITEM_IMAGE_SIZES}
                                  className={CART_ITEM_IMAGE_CLASS}
                                  unoptimized
                                />
                              ) : (
                                <Package className={CART_ITEM_IMAGE_ICON_CLASS} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/catalog/${item.slug}`}
                                className="font-medium hover:text-primary transition-colors line-clamp-2 text-sm"
                              >
                                {item.title}
                              </Link>
                              {item.brandName && (
                                <p className="text-xs text-muted-foreground mt-0.5">Бренд: {item.brandName}</p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <QuantityControls
                                  quantity={item.quantity}
                                  onDecrease={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  onIncrease={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  isPending={itemUpdatePending}
                                  isDisabled={controlsDisabled}
                                  buttonClassName="h-7 w-7"
                                />
                                <RemoveItemButton
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={() => handleRemoveRequest(item.id, item.title)}
                                  disabled={isCartBusy}
                                  showLabel
                                />
                              </div>
                            </div>
                        </div>
                        );
                      })}
                    </div>
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
                        {totals.hasPrice ? formatPrice(totals.sum, displayCurrency) : '—'}
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
                      {hasCategoryInCart ? 'Похожие товары' : 'Вам может понравиться'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {hasCategoryInCart ? 'Товары из той же категории' : 'Популярные позиции из каталога'}
                    </p>
                  </div>
                  <CatalogLinkButton />
                </div>

                {isRecommendationLoading ? (
                  <ProductsGridSkeleton />
                ) : showRecommendationsError ? (
                  <SectionError message={RECOMMENDATIONS_ERROR_MESSAGE} onRetry={handleRetryRecommendations} />
                ) : recommendedProducts.length > 0 ? (
                  <ProductsGrid products={recommendedProducts} />
                ) : null}
              </section>
            </>
          )}
        </div>
      </main>
      <Dialog open={confirmAction !== null} onOpenChange={handleConfirmOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmTitle}</DialogTitle>
            <DialogDescription>{confirmDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmAction(null)} disabled={confirmPending}>
              {CANCEL_LABEL}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmAction}
              disabled={confirmPending || isCartLoading || !confirmAction}
            >
              {confirmPending && <Loader2 className={CONFIRM_LOADER_ICON_CLASS} />}
              {confirmButtonLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
