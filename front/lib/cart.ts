'use client';

import { create } from 'zustand';
import { apiClient } from '@/lib/api/client';
import { isApiError } from '@/lib/api/errors';
import type { CartItem, CartResponse, Product } from '@/lib/api/types';
import { getMainProductImage } from '@/lib/products';

type CartState = {
  items: CartItem[];
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  addItem: (item: CartItem, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  reset: () => void;
};

const normalizeQuantity = (quantity: number): number => {
  const safeQuantity = Number.isFinite(quantity) ? quantity : 1;
  return Math.max(1, Math.floor(safeQuantity));
};

const applyCartResponse = (response: CartResponse): CartItem[] => response.items ?? [];

const resolveCartError = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }
  return 'Не удалось обновить корзину';
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isLoading: false,
  isReady: false,
  error: null,
  hydrate: async () => {
    if (!apiClient.isAuthenticated()) {
      set({ items: [], isReady: true, isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const cart = await apiClient.getCart();
      set({ items: applyCartResponse(cart), isLoading: false, isReady: true, error: null });
    } catch (error: unknown) {
      set({ isLoading: false, isReady: true, error: resolveCartError(error) });
    }
  },
  addItem: async (item, quantity = 1) => {
    if (!apiClient.isAuthenticated()) {
      set({ error: 'Требуется авторизация' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const cart = await apiClient.addCartItem({
        productId: item.id,
        quantity: normalizeQuantity(quantity),
      });
      set({ items: applyCartResponse(cart), isLoading: false, isReady: true, error: null });
    } catch (error: unknown) {
      set({ isLoading: false, error: resolveCartError(error) });
    }
  },
  updateQuantity: async (id, quantity) => {
    if (!apiClient.isAuthenticated()) {
      set({ error: 'Требуется авторизация' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const cart = await apiClient.updateCartItem(id, { quantity: normalizeQuantity(quantity) });
      set({ items: applyCartResponse(cart), isLoading: false, isReady: true, error: null });
    } catch (error: unknown) {
      set({ isLoading: false, error: resolveCartError(error) });
    }
  },
  removeItem: async (id) => {
    if (!apiClient.isAuthenticated()) {
      set({ error: 'Требуется авторизация' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const cart = await apiClient.removeCartItem(id);
      set({ items: applyCartResponse(cart), isLoading: false, isReady: true, error: null });
    } catch (error: unknown) {
      set({ isLoading: false, error: resolveCartError(error) });
    }
  },
  clear: async () => {
    if (!apiClient.isAuthenticated()) {
      set({ items: [], isReady: true, isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const cart = await apiClient.clearCart();
      set({ items: applyCartResponse(cart), isLoading: false, isReady: true, error: null });
    } catch (error: unknown) {
      set({ isLoading: false, error: resolveCartError(error) });
    }
  },
  reset: () => set({ items: [], isLoading: false, isReady: false, error: null }),
}));

export const createCartItemFromProduct = (product: Product): CartItem => {
  const mainImage = getMainProductImage(product.images);

  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    title: product.title,
    price: product.price,
    currency: product.currency,
    quantity: 1,
    brandName: product.brand?.name ?? undefined,
    categoryId: product.categoryId ?? undefined,
    imageUrl: mainImage?.url ?? null,
    imageAlt: mainImage?.alt ?? null,
  };
};

export const getCartItemsCount = (items: CartItem[]): number =>
  items.reduce((total, item) => total + item.quantity, 0);

export const buildCartDescription = (items: CartItem[]): string => {
  if (items.length === 0) return '';
  const lines = items.map((item, index) => {
    const sku = item.sku ? ` (SKU: ${item.sku})` : '';
    const brand = item.brandName ? `, бренд: ${item.brandName}` : '';
    const qty = item.quantity > 1 ? ` x${item.quantity}` : '';
    return `${index + 1}. ${item.title}${sku}${brand}${qty}`;
  });
  return `Товары:\n${lines.join('\n')}`;
};
