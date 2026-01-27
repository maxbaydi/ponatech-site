import {
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Req,
  Sse,
  UseGuards,
  MessageEvent,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable, concat, from, interval, map, merge } from 'rxjs';
import { JwtAuthGuard, type RequestWithUser } from '../auth/jwt-auth.guard';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ChatEventsService } from './chat-events.service';
import { ChatRepository } from './chat.repository';

const HEARTBEAT_INTERVAL_MS = 30000;
const MANAGER_ROLES = [Role.Manager, Role.Admin, Role.SuperAdmin];

@ApiTags('chat-events')
@Controller('chat/events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatSseController {
  constructor(
    private readonly chatEventsService: ChatEventsService,
    private readonly chatRepository: ChatRepository,
  ) {}

  @Sse('stream')
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  async streamEvents(@Req() req: RequestWithUser): Promise<Observable<MessageEvent>> {
    const user = req.user;
    if (!user) {
      return new Observable();
    }

    const isManager = MANAGER_ROLES.includes(user.role as Role);

    const events$ = isManager
      ? this.chatEventsService.getEventsForManager()
      : user.email
        ? this.chatEventsService.getEventsForEmail(user.email)
        : this.chatEventsService.getEventsForUser(user.userId);

    const lastEventId = this.parseLastEventId(req);
    const backlog = lastEventId
      ? await (isManager
        ? this.chatEventsService.getBacklogForManager(lastEventId)
        : user.email
          ? this.chatEventsService.getBacklogForEmail(user.email, lastEventId)
          : this.chatEventsService.getBacklogForUser(user.userId, lastEventId))
      : [];

    const heartbeat$ = interval(HEARTBEAT_INTERVAL_MS).pipe(
      map(() => ({ data: { type: 'heartbeat', timestamp: Date.now() } })),
    );

    const stream$ = concat(
      from(backlog),
      events$,
    );

    return merge(
      stream$.pipe(
        map((event) => ({
          data: event,
          id: String(event.id),
        })),
      ),
      heartbeat$,
    );
  }

  @Sse('stream/:requestId')
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  async streamRequestEvents(
    @Param('requestId') requestId: string,
    @Req() req: RequestWithUser,
  ): Promise<Observable<MessageEvent>> {
    const user = req.user;
    if (!user) {
      return new Observable();
    }

    const request = await this.chatRepository.getRequestById(requestId);
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const isManager = MANAGER_ROLES.includes(user.role as Role);
    if (!isManager) {
      const email = user.email?.trim().toLowerCase();
      if (!email || email !== request.email.toLowerCase()) {
        throw new ForbiddenException('Access denied');
      }
    }

    const events$ = this.chatEventsService.getEventsForRequest(requestId);

    const lastEventId = this.parseLastEventId(req);
    const backlog = lastEventId
      ? await this.chatEventsService.getBacklogForRequest(requestId, lastEventId)
      : [];

    const heartbeat$ = interval(HEARTBEAT_INTERVAL_MS).pipe(
      map(() => ({ data: { type: 'heartbeat', timestamp: Date.now() } })),
    );

    const stream$ = concat(
      from(backlog),
      events$,
    );

    return merge(
      stream$.pipe(
        map((event) => ({
          data: event,
          id: String(event.id),
        })),
      ),
      heartbeat$,
    );
  }

  private parseLastEventId(req: RequestWithUser): number | undefined {
    const headerValue = req.headers['last-event-id'];
    const header = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    const queryValue = req.query?.lastEventId;
    const query = Array.isArray(queryValue) ? queryValue[0] : queryValue;
    const raw = header ?? query;

    if (typeof raw !== 'string') {
      return undefined;
    }

    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return undefined;
    }

    return parsed;
  }
}
