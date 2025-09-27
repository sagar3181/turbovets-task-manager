import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            issueToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should validate user and return a token', async () => {
      (authService.validateUser as jest.Mock).mockResolvedValue({ id: 1, email: 'test@test.com' });
      (authService.issueToken as jest.Mock).mockReturnValue({ access_token: 'mock-token' });

      const result = await authController.login({ email: 'test@test.com', password: 'pass123' });

      expect(authService.validateUser).toHaveBeenCalledWith('test@test.com', 'pass123');
      expect(authService.issueToken).toHaveBeenCalledWith({ id: 1, email: 'test@test.com' });
      expect(result).toEqual({ access_token: 'mock-token' });
    });
  });
});
