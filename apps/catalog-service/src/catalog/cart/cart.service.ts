import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import type { ProductResponse } from '../products/dto/product.dto';
import { ProductsRepository } from '../products/products.repository';
import { getMainProductImage } from '../products/product-image.utils';
import { CartRepository, type CartWithItems } from './cart.repository';
import {
  AddCartItemDto,
  CartItemResponse,
  CartRecommendationsResponse,
  CartResponse,
  UpdateCartItemDto,
} from './dto/cart.dto';

const DEFAULT_RECOMMENDATIONS_LIMIT = 4;
const MIN_RECOMMENDATIONS_LIMIT = 1;
const MAX_RECOMMENDATIONS_LIMIT = 12;
const CATEGORY_SEED_LIMIT = 3;
const BRAND_SEED_LIMIT = 3;
const CATEGORY_CANDIDATES_LIMIT = 24;
const BRAND_CANDIDATES_LIMIT = 24;
const FALLBACK_CANDIDATES_LIMIT = 24;
const CATEGORY_MATCH_SCORE = 4;
const BRAND_MATCH_SCORE = 3;
const PRICE_SIMILARITY_SCORE = 2;
const PRICE_SIMILARITY_RATIO = 0.25;
const RECOMMENDATION_SORT = 'created_desc';

type RecommendationContext = {
  categoryWeights: Map<string, number>;
  brandWeights: Map<string, number>;
  categoryIds: string[];
  brandIds: string[];
  averagePrice?: number;
};

type RecommendationRankInput = {
  categoryCandidates: ProductResponse[];
  brandCandidates: ProductResponse[];
  fallbackCandidates: ProductResponse[];
  cartProductIds: Set<string>;
  categoryWeights: Map<string, number>;
  brandWeights: Map<string, number>;
  averagePrice?: number;
  limit: number;
};

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

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

  async getRecommendations(userId: string, limit?: number | string): Promise<CartRecommendationsResponse> {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      return { items: [] };
    }

    const { validItems, removedIds } = this.toCartItems(cart);

    if (removedIds.length > 0) {
      await this.cartRepository.removeItemsByIds(removedIds);
    }

    if (validItems.length === 0) {
      return { items: [] };
    }

    const normalizedLimit = this.normalizeRecommendationsLimit(limit);
    const { categoryWeights, brandWeights, categoryIds, brandIds, averagePrice } =
      this.buildRecommendationContext(validItems);

    const [categoryCandidates, brandCandidates, fallbackCandidates] = await Promise.all([
      categoryIds.length > 0
        ? this.fetchCandidateProducts({ categoryIds, limit: CATEGORY_CANDIDATES_LIMIT })
        : Promise.resolve([]),
      brandIds.length > 0 ? this.fetchCandidateProducts({ brandIds, limit: BRAND_CANDIDATES_LIMIT }) : Promise.resolve([]),
      this.fetchCandidateProducts({ limit: FALLBACK_CANDIDATES_LIMIT }),
    ]);

    const cartProductIds = new Set(validItems.map((item) => item.product.id));
    const recommendations = this.rankRecommendations({
      categoryCandidates,
      brandCandidates,
      fallbackCandidates,
      cartProductIds,
      categoryWeights,
      brandWeights,
      averagePrice,
      limit: normalizedLimit,
    });

    return { items: recommendations };
  }

  private toCartItems(
    cart: CartWithItems,
  ): { items: CartItemResponse[]; removedIds: string[]; validItems: CartWithItems['items'] } {
    const items: CartItemResponse[] = [];
    const removedIds: string[] = [];
    const validItems: CartWithItems['items'] = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product || product.deletedAt) {
        removedIds.push(item.id);
        continue;
      }

      validItems.push(item);
      const mainImage = getMainProductImage(product.images);
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
        imageUrl: mainImage?.url ?? null,
        imageAlt: mainImage?.alt ?? null,
      });
    }

    return { items, removedIds, validItems };
  }

  private buildRecommendationContext(items: CartWithItems['items']): RecommendationContext {
    const categoryWeights = new Map<string, number>();
    const brandWeights = new Map<string, number>();
    const prices: number[] = [];

    for (const item of items) {
      const product = item.product;
      this.addWeight(categoryWeights, product.categoryId, item.quantity);
      this.addWeight(brandWeights, product.brandId, item.quantity);
      const price = Number(product.price);
      if (Number.isFinite(price)) {
        prices.push(price);
      }
    }

    const averagePrice =
      prices.length > 0 ? prices.reduce((total, value) => total + value, 0) / prices.length : undefined;

    return {
      categoryWeights,
      brandWeights,
      categoryIds: this.getTopKeysByWeight(categoryWeights, CATEGORY_SEED_LIMIT),
      brandIds: this.getTopKeysByWeight(brandWeights, BRAND_SEED_LIMIT),
      averagePrice,
    };
  }

  private normalizeRecommendationsLimit(limit?: number | string): number {
    const parsed = typeof limit === 'string' ? Number(limit) : limit;
    if (!Number.isFinite(parsed)) {
      return DEFAULT_RECOMMENDATIONS_LIMIT;
    }
    const normalized = Math.floor(parsed as number);
    if (normalized < MIN_RECOMMENDATIONS_LIMIT) {
      return DEFAULT_RECOMMENDATIONS_LIMIT;
    }
    return Math.min(normalized, MAX_RECOMMENDATIONS_LIMIT);
  }

  private getTopKeysByWeight(weights: Map<string, number>, limit: number): string[] {
    return Array.from(weights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key]) => key);
  }

  private addWeight(weights: Map<string, number>, key: string | null | undefined, value: number): void {
    if (!key) return;
    const nextValue = (weights.get(key) ?? 0) + value;
    weights.set(key, nextValue);
  }

  private async fetchCandidateProducts(params: {
    categoryIds?: string[];
    brandIds?: string[];
    limit: number;
  }): Promise<ProductResponse[]> {
    const filters: Record<string, string | string[] | undefined> = {
      status: ProductStatus.PUBLISHED,
      limit: String(params.limit),
      sort: RECOMMENDATION_SORT,
    };

    if (params.categoryIds?.length) {
      filters.categoryId = this.joinIds(params.categoryIds);
    }

    if (params.brandIds?.length) {
      filters.brandId = this.joinIds(params.brandIds);
    }

    const { data } = await this.productsRepository.findAll(filters);
    return data;
  }

  private joinIds(ids: string[]): string {
    return ids.join(',');
  }

  private rankRecommendations({
    categoryCandidates,
    brandCandidates,
    fallbackCandidates,
    cartProductIds,
    categoryWeights,
    brandWeights,
    averagePrice,
    limit,
  }: RecommendationRankInput): ProductResponse[] {
    const scored = new Map<string, { product: ProductResponse; score: number }>();

    const applyCandidates = (products: ProductResponse[]) => {
      for (const product of products) {
        if (cartProductIds.has(product.id)) continue;
        const score = this.scoreProduct(product, categoryWeights, brandWeights, averagePrice);
        const existing = scored.get(product.id);
        if (!existing || existing.score < score) {
          scored.set(product.id, { product, score });
        }
      }
    };

    applyCandidates(categoryCandidates);
    applyCandidates(brandCandidates);
    applyCandidates(fallbackCandidates);

    return Array.from(scored.values())
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return b.product.createdAt.getTime() - a.product.createdAt.getTime();
      })
      .slice(0, limit)
      .map(({ product }) => product);
  }

  private scoreProduct(
    product: ProductResponse,
    categoryWeights: Map<string, number>,
    brandWeights: Map<string, number>,
    averagePrice?: number,
  ): number {
    const categoryScore = this.getWeight(categoryWeights, product.categoryId) * CATEGORY_MATCH_SCORE;
    const brandScore = this.getWeight(brandWeights, product.brandId) * BRAND_MATCH_SCORE;
    const priceScore = this.getPriceScore(product.price, averagePrice);
    return categoryScore + brandScore + priceScore;
  }

  private getWeight(weights: Map<string, number>, key?: string | null): number {
    if (!key) return 0;
    return weights.get(key) ?? 0;
  }

  private getPriceScore(priceValue: ProductResponse['price'], averagePrice?: number): number {
    if (!averagePrice || averagePrice <= 0) {
      return 0;
    }
    const price = Number(priceValue);
    if (!Number.isFinite(price)) {
      return 0;
    }
    const diffRatio = Math.abs(price - averagePrice) / averagePrice;
    return diffRatio <= PRICE_SIMILARITY_RATIO ? PRICE_SIMILARITY_SCORE : 0;
  }
}

const normalizeQuantity = (quantity: number): number => {
  const safeQuantity = Number.isFinite(quantity) ? quantity : 1;
  return Math.max(1, Math.floor(safeQuantity));
};
