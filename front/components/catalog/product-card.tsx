'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageCanvas } from '@/components/ui/image-canvas';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/api/types';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const htmlToText = (html?: string | null): string => {
  if (!html) return '';
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || '').trim();
  } catch {
    return html.replace(/<[^>]*>/g, '').trim();
  }
};

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const mainImage = product.images?.find((img) => img.isMain) || product.images?.[0];
  const descriptionText = htmlToText(product.description);

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
              <Link href={`/catalog/${product.slug}`}>
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
            <div className="flex items-center justify-between mt-4">
              <p className="font-bold text-xl text-primary">{formatPrice(product.price, product.currency)}</p>
              <Button asChild size="sm">
                <Link href={`/catalog/${product.slug}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Подробнее
                </Link>
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Link href={`/catalog/${product.slug}`}>
      <Card className="group overflow-hidden card-hover h-full">
        <div className="relative">
          <ImageCanvas src={mainImage?.url} alt={product.title} />
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
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">SKU: {product.sku}</p>
          <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.title}
          </h3>
          {product.category && (
            <Badge variant="outline" className="text-xs mb-3">
              {product.category.name}
            </Badge>
          )}
          <p className="font-bold text-lg text-primary">{formatPrice(product.price, product.currency)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
