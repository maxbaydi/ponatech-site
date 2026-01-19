import type { ProductImage } from '@prisma/client';

export const getMainProductImage = (images?: ProductImage[] | null): ProductImage | undefined => {
  if (!images?.length) {
    return undefined;
  }
  return images.find((image) => image.isMain) ?? images[0];
};
