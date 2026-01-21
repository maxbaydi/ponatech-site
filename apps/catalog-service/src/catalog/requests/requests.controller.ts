import { Body, Controller, Get, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, type RequestWithUser } from '../auth/jwt-auth.guard';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateRequestDto,
  GetRequestsQueryDto,
  PaginatedResponse,
  RequestResponse,
  SupplyRequestResponse,
  SupplyRequestStatsResponse,
  UpdateRequestStatusDto,
} from './dto/request.dto';
import { RequestsService } from './requests.service';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  async create(@Body() dto: CreateRequestDto): Promise<RequestResponse> {
    return this.requestsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async findAll(
    @Query() query: GetRequestsQueryDto,
  ): Promise<PaginatedResponse<SupplyRequestResponse>> {
    return this.requestsService.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  async findMy(
    @Req() req: RequestWithUser,
    @Query() query: GetRequestsQueryDto,
  ): Promise<PaginatedResponse<SupplyRequestResponse>> {
    const email = req.user?.email;
    if (!email) {
      throw new UnauthorizedException('Missing user email');
    }

    return this.requestsService.findAllByEmail(email, query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async getStats(): Promise<SupplyRequestStatsResponse> {
    return this.requestsService.getStats();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRequestStatusDto,
  ): Promise<SupplyRequestResponse> {
    return this.requestsService.updateStatus(id, dto);
  }
}
