'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Eye, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, type ButtonProps } from '@/components/ui/button';
import { ImageCanvas } from '@/components/ui/image-canvas';
import { createCartItemFromProduct, useCartStore } from '@/lib/cart';
import { useAuth } from '@/lib/auth/auth-context';
import { buildLoginRedirectUrl } from '@/lib/auth/login-redirect';
import { getMainProductImage } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/api/types';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const DETAILS_LABEL = 'Подробнее';
const ADD_TO_CART_LABEL = 'Добавить в корзину';
const REMOVE_FROM_CART_LABEL = 'Удалить из корзины';
const DETAILS_BUTTON_SIZE: ButtonProps['size'] = 'sm';
const CART_BUTTON_SIZE: ButtonProps['size'] = 'sm';
const CART_BUTTON_CLASS = 'shrink-0 gap-1 px-2';

const htmlToText = (html?: string | null): string => {
  if (!html) return '';
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || '').trim();
  } catch {
    return html.replace(/<[^>]*>/g, '').trim();
  }
};

type DetailsButtonProps = {
  href: string;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  className?: string;
};

function DetailsLinkContent() {
  return (
    <>
      <Eye className="mr-2 h-4 w-4" />
      {DETAILS_LABEL}
    </>
  );
}

function DetailsButton({ href, size = DETAILS_BUTTON_SIZE, variant, className }: DetailsButtonProps) {
  return (
    <Button asChild size={size} variant={variant} className={className}>
      <Link href={href}>
        <DetailsLinkContent />
      </Link>
    </Button>
  );
}

type CartActionButtonProps = {
  product: Product;
  size?: ButtonProps['size'];
};

const CART_ACTIONS = {
  add: {
    label: ADD_TO_CART_LABEL,
    variant: 'outline',
    Icon: Plus,
  },
  remove: {
    label: REMOVE_FROM_CART_LABEL,
    variant: 'destructive',
    Icon: Minus,
  },
} as const satisfies Record<
  'add' | 'remove',
  { label: string; variant: ButtonProps['variant']; Icon: typeof Plus }
>;

function CartActionButton({ product, size = CART_BUTTON_SIZE }: CartActionButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const isCartLoading = useCartStore((state) => state.isLoading);
  const isInCart = useCartStore((state) => state.items.some((item) => item.id === product.id));
  const action = isInCart ? 'remove' : 'add';
  const { Icon, label, variant } = CART_ACTIONS[action];

  const handleCartAction = () => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      const currentSearch = searchParams.toString();
      const nextHref = currentSearch ? `${pathname}?${currentSearch}` : pathname;
      router.push(buildLoginRedirectUrl(nextHref));
      return;
    }
    if (isInCart) {
      removeItem(product.id);
      return;
    }
    addItem(createCartItemFromProduct(product));
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={CART_BUTTON_CLASS}
      aria-label={label}
      onClick={handleCartAction}
      disabled={isCartLoading || isAuthLoading}
    >
      <ShoppingCart />
      <Icon />
    </Button>
  );
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const mainImage = getMainProductImage(product.images);
  const descriptionText = htmlToText(product.description);
  const productHref = `/catalog/${product.slug}`;

  if (viewMode === 'list') {
    return (
      <Card className="group overflow-hidden card-hover">
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <ImageCanvas src={mainImage?.url} alt={product.title} />
            {product.brand && (
              <Badge variant="secondary" className="absolute top-3 left-3 z-10">
                {product.brand.name}
              </Badge>
            )}
          </div>
          <CardContent className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">SKU: {product.sku}</p>
              <Link href={productHref}>
                <h3 className="font-medium text-base mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {product.title}
                </h3>
              </Link>
              {descriptionText && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{descriptionText}</p>
              )}
              {product.category && (
                <Badge variant="outline" className="text-xs">
                  {product.category.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between mt-4 gap-3">
              <p className="font-bold text-xl text-primary">{formatPrice(product.price, product.currency)}</p>
              <div className="flex items-center gap-2">
                <DetailsButton href={productHref} />
                <CartActionButton product={product} />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden card-hover h-full flex flex-col">
      <div className="relative">
        <Link href={productHref} className="block">
          <ImageCanvas src={mainImage?.url} alt={product.title} />
        </Link>
        {product.brand && (
          <Badge variant="secondary" className="absolute top-3 left-3 z-10">
            {product.brand.name}
          </Badge>
        )}
        {typeof product.stock === 'number' && product.stock === 0 && (
          <Badge variant="destructive" className="absolute top-3 right-3 z-10">
            Нет в наличии
          </Badge>
        )}
      </div>
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">SKU: {product.sku}</p>
          <Link href={productHref}>
            <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-10">
              {product.title}
            </h3>
          </Link>
          {product.category && (
            <Badge variant="outline" className="text-xs mb-3">
              {product.category.name}
            </Badge>
          )}
          <p className="font-bold text-lg text-primary">{formatPrice(product.price, product.currency)}</p>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <DetailsButton
            href={productHref}
            variant="outline"
            className="flex-1 justify-center transition-colors hover:bg-primary hover:text-primary-foreground"
          />
          <CartActionButton product={product} />
        </div>
      </CardContent>
    </Card>
  );
}
