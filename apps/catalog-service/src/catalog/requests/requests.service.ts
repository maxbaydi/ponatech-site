import { Injectable } from '@nestjs/common';
import { CreateRequestDto, RequestResponse } from './dto/request.dto';
import { RequestsRepository } from './requests.repository';

@Injectable()
export class RequestsService {
  constructor(private readonly requestsRepository: RequestsRepository) {}

  async create(dto: CreateRequestDto): Promise<RequestResponse> {
    return this.requestsRepository.create(dto);
  }
}
