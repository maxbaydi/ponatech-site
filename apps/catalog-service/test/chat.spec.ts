import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ChatMessageSender, SupplyRequestStatus, UserRole } from '@prisma/client';

jest.setTimeout(30000);

const TEST_CUSTOMER_EMAIL = 'test-customer@example.com';
const testUserIds = { managerId: '', customerId: '' };

const ensureSchema = (): void => {
  const schemaPath = join(process.cwd(), 'apps', 'catalog-service', 'prisma', 'schema.prisma');
  const prismaCliPath = join(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js');

  execFileSync(
    process.execPath,
    [prismaCliPath, 'db', 'push', '--accept-data-loss', '--skip-generate', '--schema', schemaPath],
    { stdio: 'inherit', env: process.env },
  );
};

describe('ChatController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL =
      process.env.TEST_DATABASE_URL ??
      'postgresql://ponatech:ponatech@localhost:5432/ponatech_catalog_test?schema=public';

    ensureSchema();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.chatMessageAttachment.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.supplyRequestAttachment.deleteMany();
    await prisma.supplyRequest.deleteMany();
    await prisma.user.deleteMany();

    const manager = await prisma.user.create({
      data: {
        email: 'test-manager@example.com',
        passwordHash: 'test-hash',
        role: UserRole.MANAGER,
        isActive: true,
      },
    });
    testUserIds.managerId = manager.id;

    const customer = await prisma.user.create({
      data: {
        email: TEST_CUSTOMER_EMAIL,
        passwordHash: 'test-hash',
        role: UserRole.CUSTOMER,
        isActive: true,
      },
    });
    testUserIds.customerId = customer.id;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  const createTestRequest = async (email = TEST_CUSTOMER_EMAIL) => {
    return prisma.supplyRequest.create({
      data: {
        name: 'Test Customer',
        email,
        phone: '+79001234567',
        company: 'Test Company',
        description: 'Test request description',
        status: SupplyRequestStatus.NEW,
      },
    });
  };

  describe('POST /chat/messages', () => {
    it('allows customer to send message to their request', async () => {
      const supplyRequest = await createTestRequest();

      const response = await request(app.getHttpServer())
        .post('/chat/messages')
        .set('x-role', 'CUSTOMER')
        .set('x-email', TEST_CUSTOMER_EMAIL)
        .send({
          requestId: supplyRequest.id,
          content: 'Hello, I have a question about my request.',
        })
        .expect(201);

      expect(response.body.requestId).toBe(supplyRequest.id);
      expect(response.body.content).toBe('Hello, I have a question about my request.');
      expect(response.body.senderType).toBe('CUSTOMER');
      expect(response.body.attachments).toEqual([]);
    });

    it('allows manager to send message to any request', async () => {
      const supplyRequest = await createTestRequest();

      const response = await request(app.getHttpServer())
        .post('/chat/messages')
        .set('x-role', 'MANAGER')
        .set('x-user-id', testUserIds.managerId)
        .send({
          requestId: supplyRequest.id,
          content: 'Thank you for your request. We will process it shortly.',
        })
        .expect(201);

      expect(response.body.requestId).toBe(supplyRequest.id);
      expect(response.body.senderType).toBe('MANAGER');
    });

    it('denies customer access to another customer request', async () => {
      const supplyRequest = await createTestRequest('other@example.com');

      await request(app.getHttpServer())
        .post('/chat/messages')
        .set('x-role', 'CUSTOMER')
        .set('x-email', TEST_CUSTOMER_EMAIL)
        .send({
          requestId: supplyRequest.id,
          content: 'Trying to access other request',
        })
        .expect(403);
    });

    it('returns 404 for non-existent request', async () => {
      await request(app.getHttpServer())
        .post('/chat/messages')
        .set('x-role', 'CUSTOMER')
        .set('x-email', TEST_CUSTOMER_EMAIL)
        .send({
          requestId: randomUUID(),
          content: 'Message to non-existent request',
        })
        .expect(404);
    });

    it('validates message content', async () => {
      const supplyRequest = await createTestRequest();

      await request(app.getHttpServer())
        .post('/chat/messages')
        .set('x-role', 'CUSTOMER')
        .set('x-email', TEST_CUSTOMER_EMAIL)
        .send({
          requestId: supplyRequest.id,
          content: '',
        })
        .expect(400);
    });
  });

  describe('GET /chat/messages/:requestId', () => {
    it('returns messages for customer own request', async () => {
      const supplyRequest = await createTestRequest();

      await prisma.chatMessage.createMany({
        data: [
          {
            requestId: supplyRequest.id,
            senderType: ChatMessageSender.CUSTOMER,
            content: 'Customer message 1',
          },
          {
            requestId: supplyRequest.id,
            senderType: ChatMessageSender.MANAGER,
            senderId: testUserIds.managerId,
            content: 'Manager response',
          },
          {
            requestId: supplyRequest.id,
            senderType: ChatMessageSender.SYSTEM,
            content: 'Status changed',
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get(`/chat/messages/${supplyRequest.id}`)
        .set('x-role', 'CUSTOMER')
        .set('x-email', TEST_CUSTOMER_EMAIL)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.total).toBe(3);
      expect(response.body.data[0].senderType).toBe('CUSTOMER');
      expect(response.body.data[1].senderType).toBe('MANAGER');
      expect(response.body.data[2].senderType).toBe('SYSTEM');
    });

    it('returns messages for manager for any request', async () => {
      const supplyRequest = await createTestRequest('any@example.com');

      await prisma.chatMessage.create({
        data: {
          requestId: supplyRequest.id,
          senderType: ChatMessageSender.CUSTOMER,
          content: 'Customer message',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/chat/messages/${supplyRequest.id}`)
        .set('x-role', 'MANAGER')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('denies customer access to another request messages', async () => {
      const supplyRequest = await createTestRequest('other@example.com');

      await request(app.getHttpServer())
        .get(`/chat/messages/${supplyRequest.id}`)
        .set('x-role', 'CUSTOMER')
        .set('x-email', TEST_CUSTOMER_EMAIL)
        .expect(403);
    });

    it('supports pagination', async () => {
      const supplyRequest = await createTestRequest();

      for (let i = 0; i < 5; i++) {
        await prisma.chatMessage.create({
          data: {
            requestId: supplyRequest.id,
            senderType: ChatMessageSender.CUSTOMER,
            content: `Message ${i + 1}`,
          },
        });
      }

      const page1 = await request(app.getHttpServer())
        .get(`/chat/messages/${supplyRequest.id}?page=1&limit=2`)
        .set('x-role', 'CUSTOMER')
        .set('x-email', TEST_CUSTOMER_EMAIL)
        .expect(200);

      expect(page1.body.data).toHaveLength(2);
      expect(page1.body.total).toBe(5);
      expect(page1.body.page).toBe(1);
      expect(page1.body.totalPages).toBe(3);
    });
  });

  describe('GET /chat/list', () => {
    it('returns chat list for manager', async () => {
      const request1 = await createTestRequest('customer1@example.com');
      const request2 = await createTestRequest('customer2@example.com');

      await prisma.chatMessage.create({
        data: {
          requestId: request1.id,
          senderType: ChatMessageSender.CUSTOMER,
          content: 'Message from customer 1',
        },
      });

      await prisma.chatMessage.create({
        data: {
          requestId: request2.id,
          senderType: ChatMessageSender.CUSTOMER,
          content: 'Message from customer 2',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/chat/list')
        .set('x-role', 'MANAGER')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('requestId');
      expect(response.body[0]).toHaveProperty('customerName');
      expect(response.body[0]).toHaveProperty('customerEmail');
      expect(response.body[0]).toHaveProperty('lastMessage');
      expect(response.body[0]).toHaveProperty('unreadCount');
    });

    it('returns only own chats for customer', async () => {
      const ownRequest = await createTestRequest(TEST_CUSTOMER_EMAIL);
      const otherRequest = await createTestRequest('other@example.com');

      await prisma.chatMessage.create({
        data: {
          requestId: ownRequest.id,
          senderType: ChatMessageSender.CUSTOMER,
          content: 'My message',
        },
      });

      await prisma.chatMessage.create({
        data: {
          requestId: otherRequest.id,
          senderType: ChatMessageSender.CUSTOMER,
          content: 'Other message',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/chat/list')
        .set('x-role', 'CUSTOMER')
        .set('x-email', TEST_CUSTOMER_EMAIL)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].customerEmail).toBe(TEST_CUSTOMER_EMAIL);
    });
  });

  describe('POST /chat/mark-read/:requestId', () => {
    it('marks messages as read for customer', async () => {
      const supplyRequest = await createTestRequest();

      await prisma.chatMessage.create({
        data: {
          requestId: supplyRequest.id,
          senderType: ChatMessageSender.MANAGER,
          content: 'Manager message',
          isRead: false,
        },
      });

      await request(app.getHttpServer())
        .post(`/chat/mark-read/${supplyRequest.id}`)
        .set('x-role', 'CUSTOMER')
        .set('x-email', TEST_CUSTOMER_EMAIL)
        .expect(201);

      const messages = await prisma.chatMessage.findMany({
        where: { requestId: supplyRequest.id },
      });

      expect(messages[0].isRead).toBe(true);
    });

    it('marks messages as read for manager', async () => {
      const supplyRequest = await createTestRequest();

      await prisma.chatMessage.create({
        data: {
          requestId: supplyRequest.id,
          senderType: ChatMessageSender.CUSTOMER,
          content: 'Customer message',
          isRead: false,
        },
      });

      await request(app.getHttpServer())
        .post(`/chat/mark-read/${supplyRequest.id}`)
        .set('x-role', 'MANAGER')
        .expect(201);

      const messages = await prisma.chatMessage.findMany({
        where: { requestId: supplyRequest.id },
      });

      expect(messages[0].isRead).toBe(true);
    });
  });

  describe('GET /chat/stats', () => {
    it('returns stats for manager', async () => {
      const request1 = await createTestRequest();
      const request2 = await createTestRequest();

      await prisma.chatMessage.create({
        data: {
          requestId: request1.id,
          senderType: ChatMessageSender.CUSTOMER,
          content: 'Unread message',
          isRead: false,
        },
      });

      await prisma.chatMessage.create({
        data: {
          requestId: request2.id,
          senderType: ChatMessageSender.CUSTOMER,
          content: 'Read message',
          isRead: true,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/chat/stats')
        .set('x-role', 'MANAGER')
        .expect(200);

      expect(response.body).toHaveProperty('totalChats');
      expect(response.body).toHaveProperty('unreadChats');
      expect(response.body.totalChats).toBe(2);
      expect(response.body.unreadChats).toBe(1);
    });
  });

  describe('System messages on status change', () => {
    it('sends system message when status changes', async () => {
      const supplyRequest = await createTestRequest();

      await request(app.getHttpServer())
        .patch(`/requests/${supplyRequest.id}/status`)
        .set('x-role', 'MANAGER')
        .send({ status: 'IN_PROGRESS' })
        .expect(200);

      const messages = await prisma.chatMessage.findMany({
        where: { requestId: supplyRequest.id },
      });

      expect(messages).toHaveLength(1);
      expect(messages[0].senderType).toBe('SYSTEM');
      expect(messages[0].content).toContain('заявка');
    });
  });
});
