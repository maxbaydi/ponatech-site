'use client';

import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import type { ProductImage } from '@/lib/api/types';

const PRODUCT_IMAGE_SIZE = 40;
const PRODUCT_IMAGE_CELL_CLASS = 'h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden';
const PRODUCT_IMAGE_CLASS = 'h-10 w-10 rounded-md object-cover';
const PRODUCT_IMAGE_ICON_CLASS = 'h-4 w-4 text-muted-foreground';

const getProductPreview = (images?: ProductImage[]) => {
  const list = images ?? [];
  const mainImage = list.find((image) => image.isMain) ?? list[0];
  if (!mainImage?.url) return null;
  return {
    url: mainImage.url,
    alt: mainImage.alt,
  };
};

export function ProductImagePreview({ images, title }: { images?: ProductImage[]; title: string }) {
  const preview = getProductPreview(images);

  if (!preview) {
    return (
      <div className={PRODUCT_IMAGE_CELL_CLASS}>
        <ImageOff className={PRODUCT_IMAGE_ICON_CLASS} />
      </div>
    );
  }

  return (
    <Image
      src={preview.url}
      alt={preview.alt ?? title}
      width={PRODUCT_IMAGE_SIZE}
      height={PRODUCT_IMAGE_SIZE}
      className={PRODUCT_IMAGE_CLASS}
      unoptimized
    />
  );
}
