import { Injectable, NotFoundException } from '@nestjs/common';
import { CartRepository, type CartWithItems } from './cart.repository';
import { AddCartItemDto, CartItemResponse, CartResponse, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async getCart(userId: string): Promise<CartResponse> {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      return { items: [] };
    }

    const { items, removedIds } = this.toCartItems(cart);

    if (removedIds.length > 0) {
      await this.cartRepository.removeItemsByIds(removedIds);
    }

    return { items };
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartResponse> {
    const product = await this.cartRepository.findActiveProduct(dto.productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const quantity = normalizeQuantity(dto.quantity ?? 1);
    const cart = await this.cartRepository.upsertCart(userId);
    await this.cartRepository.upsertItem(cart.id, product.id, quantity);
    return this.getCart(userId);
  }

  async updateItem(userId: string, productId: string, dto: UpdateCartItemDto): Promise<CartResponse> {
    const quantity = normalizeQuantity(dto.quantity);
    const cart = await this.cartRepository.upsertCart(userId);
    await this.cartRepository.updateItemQuantity(cart.id, productId, quantity);
    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string): Promise<CartResponse> {
    const cart = await this.cartRepository.upsertCart(userId);
    await this.cartRepository.removeItem(cart.id, productId);
    return this.getCart(userId);
  }

  async clear(userId: string): Promise<CartResponse> {
    const cart = await this.cartRepository.upsertCart(userId);
    await this.cartRepository.clearCart(cart.id);
    return { items: [] };
  }

  private toCartItems(cart: CartWithItems): { items: CartItemResponse[]; removedIds: string[] } {
    const items: CartItemResponse[] = [];
    const removedIds: string[] = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product || product.deletedAt) {
        removedIds.push(item.id);
        continue;
      }

      items.push({
        id: product.id,
        slug: product.slug,
        sku: product.sku,
        title: product.title,
        price: String(product.price),
        currency: product.currency,
        quantity: item.quantity,
        brandName: product.brand?.name ?? null,
        categoryId: product.categoryId ?? null,
      });
    }

    return { items, removedIds };
  }
}

const normalizeQuantity = (quantity: number): number => {
  const safeQuantity = Number.isFinite(quantity) ? quantity : 1;
  return Math.max(1, Math.floor(safeQuantity));
};
