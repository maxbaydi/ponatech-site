import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { Role } from '../auth/role.enum';
import { verifyJwt } from '../auth/jwt.utils';
import { ChatEventsService, type ChatEvent } from './chat-events.service';

const MANAGER_ROLES = new Set<Role>([Role.Manager, Role.Admin, Role.SuperAdmin]);
const MANAGER_ROOM = 'chat:managers';

type SocketUser = {
  userId: string;
  role: Role;
  email?: string;
};

@WebSocketGateway({
  path: '/chat/ws',
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly chatEventsService: ChatEventsService,
  ) {}

  afterInit(): void {
    this.chatEventsService.getEventsForManager().subscribe((event) => {
      this.broadcastEvent(event);
    });
  }

  async handleConnection(client: Socket): Promise<void> {
    const user = this.authenticate(client);
    if (!user) {
      client.disconnect(true);
      return;
    }

    client.data.user = user;

    if (MANAGER_ROLES.has(user.role)) {
      client.join(MANAGER_ROOM);
    } else if (user.email) {
      client.join(buildEmailRoom(user.email));
    }

    client.join(buildUserRoom(user.userId));

    await this.sendBacklog(client, user);
  }

  handleDisconnect(client: Socket): void {
    const user = client.data.user as SocketUser | undefined;
    if (user) {
      this.logger.debug(`Chat socket disconnected`, { userId: user.userId });
    }
  }

  private authenticate(client: Socket): SocketUser | null {
    const token = resolveHandshakeToken(client);
    if (!token) {
      return null;
    }

    const secret = this.configService.get<string>('JWT_SECRET') ?? '';
    const payload = verifyJwt(token, secret);

    if (!payload?.role || !Object.values(Role).includes(payload.role)) {
      return null;
    }

    const userId = payload.sub ?? payload.userId;
    if (!userId) {
      return null;
    }

    return {
      userId,
      role: payload.role,
      email: typeof payload.email === 'string' ? payload.email : undefined,
    };
  }

  private async sendBacklog(client: Socket, user: SocketUser): Promise<void> {
    const lastEventId = parseLastEventId(client);
    if (!lastEventId) {
      return;
    }

    const backlog = MANAGER_ROLES.has(user.role)
      ? await this.chatEventsService.getBacklogForManager(lastEventId)
      : user.email
        ? await this.chatEventsService.getBacklogForEmail(user.email, lastEventId)
        : await this.chatEventsService.getBacklogForUser(user.userId, lastEventId);

    for (const event of backlog) {
      client.emit('chat:event', serializeEvent(event));
    }
  }

  private broadcastEvent(event: ChatEvent): void {
    const payload = serializeEvent(event);

    this.server.to(MANAGER_ROOM).emit('chat:event', payload);

    if (event.email) {
      this.server.to(buildEmailRoom(event.email)).emit('chat:event', payload);
    }

    if (event.userId) {
      this.server.to(buildUserRoom(event.userId)).emit('chat:event', payload);
    }
  }
}

const resolveHandshakeToken = (client: Socket): string | null => {
  const authToken = client.handshake.auth?.token;
  if (typeof authToken === 'string' && authToken.trim().length > 0) {
    return authToken.trim();
  }

  const queryToken = client.handshake.query?.token;
  if (Array.isArray(queryToken)) {
    const first = queryToken[0];
    return typeof first === 'string' ? first : null;
  }
  return typeof queryToken === 'string' ? queryToken : null;
};

const parseLastEventId = (client: Socket): number | undefined => {
  const authValue = client.handshake.auth?.lastEventId;
  const queryValue = client.handshake.query?.lastEventId;
  const raw = authValue ?? queryValue;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
};

const buildEmailRoom = (email: string): string => `chat:email:${email.trim().toLowerCase()}`;

const buildUserRoom = (userId: string): string => `chat:user:${userId}`;

type ChatEventPayload = Omit<ChatEvent, 'createdAt'> & { createdAt: string };

const serializeEvent = (event: ChatEvent): ChatEventPayload => ({
  ...event,
  createdAt: event.createdAt.toISOString(),
});
