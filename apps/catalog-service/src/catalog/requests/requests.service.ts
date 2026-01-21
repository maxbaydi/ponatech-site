import { Injectable } from '@nestjs/common';
import {
  CreateRequestDto,
  GetRequestsQueryDto,
  PaginatedResponse,
  RequestResponse,
  SupplyRequestResponse,
  SupplyRequestStatsResponse,
  UpdateRequestStatusDto,
} from './dto/request.dto';
import { RequestsRepository } from './requests.repository';

@Injectable()
export class RequestsService {
  constructor(private readonly requestsRepository: RequestsRepository) {}

  async create(dto: CreateRequestDto): Promise<RequestResponse> {
    return this.requestsRepository.create(dto);
  }

  async findAll(filters?: GetRequestsQueryDto): Promise<PaginatedResponse<SupplyRequestResponse>> {
    return this.requestsRepository.findAll(filters);
  }

  async findAllByEmail(
    email: string,
    filters?: GetRequestsQueryDto,
  ): Promise<PaginatedResponse<SupplyRequestResponse>> {
    return this.requestsRepository.findAllByEmail(email, filters);
  }

  async getStats(): Promise<SupplyRequestStatsResponse> {
    return this.requestsRepository.getStats();
  }

  async updateStatus(id: string, dto: UpdateRequestStatusDto): Promise<SupplyRequestResponse> {
    return this.requestsRepository.updateStatus(id, dto.status);
  }
}
