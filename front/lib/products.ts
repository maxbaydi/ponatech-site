import type { ProductImage } from '@/lib/api/types';

export const getMainProductImage = (images?: ProductImage[] | null): ProductImage | undefined => {
  if (!images?.length) {
    return undefined;
  }
  return images.find((image) => image.isMain) ?? images[0];
};
