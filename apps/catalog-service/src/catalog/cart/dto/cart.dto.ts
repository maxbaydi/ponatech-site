import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddCartItemDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}

export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  quantity!: number;
}

export interface CartItemResponse {
  id: string;
  slug: string;
  sku: string;
  title: string;
  price: string;
  currency: string;
  quantity: number;
  brandName?: string | null;
  categoryId?: string | null;
}

export interface CartResponse {
  items: CartItemResponse[];
}
