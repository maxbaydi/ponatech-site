'use client';

import Link from 'next/link';
import { Package, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/api/types';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const mainImage = product.images?.find((img) => img.isMain) || product.images?.[0];

  if (viewMode === 'list') {
    return (
      <Card className="group overflow-hidden card-hover">
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-48 h-48 bg-muted flex items-center justify-center flex-shrink-0">
            {mainImage ? (
              <img
                src={mainImage.url}
                alt={product.title}
                className="object-contain h-full w-full p-4 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <Package className="w-16 h-16 text-muted-foreground/30" />
            )}
            {product.brand && (
              <Badge variant="secondary" className="absolute top-3 left-3">
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
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
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
        <div className="relative h-48 bg-muted flex items-center justify-center">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={product.title}
              className="object-contain h-full w-full p-4 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Package className="w-16 h-16 text-muted-foreground/30" />
          )}
          {product.brand && (
            <Badge variant="secondary" className="absolute top-3 left-3">
              {product.brand.name}
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="destructive" className="absolute top-3 right-3">
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
