import { Test } from '@nestjs/testing';
import { AuthGrpcController } from './auth.controller';
import { AuthRepository, AuthenticatedUser } from './auth.repository';
import { AuthService } from './auth.service';
import { Role } from './role.enum';

describe('AuthService validateToken', () => {
  let service: AuthService;
  let controller: AuthGrpcController;
  let repository: jest.Mocked<AuthRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthGrpcController],
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: {
            validateToken: jest.fn<Promise<AuthenticatedUser | null>, [string]>(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    controller = moduleRef.get(AuthGrpcController);
    repository = moduleRef.get(AuthRepository) as jest.Mocked<AuthRepository>;
  });

  it('returns user for valid token', async () => {
    repository.validateToken.mockResolvedValue({ userId: 'user-1', role: Role.Manager });

    await expect(service.validateToken('valid-token')).resolves.toEqual({
      userId: 'user-1',
      role: Role.Manager,
    });
    expect(repository.validateToken).toHaveBeenCalledWith('valid-token');
  });

  it.each(['expired-token', 'forged-token'])('returns null for %s', async (token) => {
    repository.validateToken.mockResolvedValue(null);

    await expect(service.validateToken(token)).resolves.toBeNull();
    expect(repository.validateToken).toHaveBeenCalledWith(token);
  });

  it('returns protobuf response for valid token', async () => {
    repository.validateToken.mockResolvedValue({ userId: 'user-1', role: Role.Manager });

    await expect(controller.validateToken({ accessToken: 'valid-token' })).resolves.toEqual({
      isValid: true,
      userId: 'user-1',
      role: Role.Manager,
    });
  });

  it.each(['expired-token', 'forged-token'])(
    'returns protobuf response for invalid token: %s',
    async (token) => {
      repository.validateToken.mockResolvedValue(null);

      await expect(controller.validateToken({ accessToken: token })).resolves.toEqual({
        isValid: false,
        userId: '',
        role: '',
      });
    },
  );
});
