import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            brand: true;
            images: {
              orderBy: {
                order: Prisma.SortOrder;
              };
            };
          };
        };
      };
    };
  };
}>;

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<CartWithItems | null> {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                images: {
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async upsertCart(userId: string): Promise<{ id: string }> {
    return this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      select: { id: true },
    });
  }

  async upsertItem(cartId: string, productId: string, quantity: number): Promise<void> {
    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId,
        productId,
        quantity,
      },
    });
  }

  async updateItemQuantity(cartId: string, productId: string, quantity: number): Promise<void> {
    await this.prisma.cartItem.updateMany({
      where: { cartId, productId },
      data: { quantity },
    });
  }

  async removeItem(cartId: string, productId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { cartId, productId } });
  }

  async clearCart(cartId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
  }

  async removeItemsByIds(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.prisma.cartItem.deleteMany({ where: { id: { in: ids } } });
  }

  async findActiveProduct(productId: string): Promise<{ id: string } | null> {
    return this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: { id: true },
    });
  }
}
