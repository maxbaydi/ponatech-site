import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, type RequestWithUser } from '../auth/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddCartItemDto, CartRecommendationsResponse, CartResponse, UpdateCartItemDto } from './dto/cart.dto';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req: RequestWithUser): Promise<CartResponse> {
    return this.cartService.getCart(this.resolveUserId(req));
  }

  @Get('recommendations')
  async getRecommendations(
    @Req() req: RequestWithUser,
    @Query('limit') limit?: string,
  ): Promise<CartRecommendationsResponse> {
    return this.cartService.getRecommendations(this.resolveUserId(req), limit);
  }

  @Post('items')
  async addItem(@Req() req: RequestWithUser, @Body() dto: AddCartItemDto): Promise<CartResponse> {
    return this.cartService.addItem(this.resolveUserId(req), dto);
  }

  @Patch('items/:productId')
  async updateItem(
    @Req() req: RequestWithUser,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponse> {
    return this.cartService.updateItem(this.resolveUserId(req), productId, dto);
  }

  @Delete('items/:productId')
  async removeItem(@Req() req: RequestWithUser, @Param('productId') productId: string): Promise<CartResponse> {
    return this.cartService.removeItem(this.resolveUserId(req), productId);
  }

  @Delete()
  async clear(@Req() req: RequestWithUser): Promise<CartResponse> {
    return this.cartService.clear(this.resolveUserId(req));
  }

  private resolveUserId(req: RequestWithUser): string {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Missing user');
    }
    return userId;
  }
}
