import type { Product, ProductImage } from '@/lib/api/types';

export const getMainProductImage = (images?: ProductImage[] | null): ProductImage | undefined => {
  if (!images?.length) {
    return undefined;
  }
  return images.find((image) => image.isMain) ?? images[0];
};

type ProductPlaceholderImage = {
  src?: string | null;
  alt?: string | null;
};

export const resolveProductImage = (
  product: Pick<Product, 'title' | 'images' | 'brand'>,
  placeholder?: ProductPlaceholderImage,
): { src?: string | null; alt: string; isFallback: boolean } => {
  const mainImage = getMainProductImage(product.images);
  if (mainImage?.url) {
    return {
      src: mainImage.url,
      alt: mainImage.alt ?? product.title,
      isFallback: false,
    };
  }

  if (placeholder?.src) {
    return {
      src: placeholder.src,
      alt: placeholder.alt ?? product.title,
      isFallback: true,
    };
  }

  if (product.brand?.logoUrl) {
    return {
      src: product.brand.logoUrl,
      alt: product.brand.name ? `${product.brand.name} logo` : product.title,
      isFallback: true,
    };
  }

  return { src: null, alt: product.title, isFallback: true };
};
