import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  const mockUser = {
    _id: 'mockUserId',
    email: 'test@example.com',
    googleId: 'googleId123',
    name: 'Test User',
    picture: 'https://example.com/picture.jpg',
  };

  const mockRequest = {
    user: mockUser,
  } as any;

  const mockResponse = {
    redirect: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleAuth', () => {
    it('should initiate Google OAuth flow', async () => {
      // This method doesn't return anything, it just initiates the OAuth flow
      const result = await controller.googleAuth(mockRequest);
      expect(result).toBeUndefined();
    });
  });

  describe('googleAuthRedirect', () => {
    it('should handle Google OAuth callback and redirect with token', async () => {
      const mockLoginResult = {
        access_token: 'mockJwtToken',
        user: {
          id: mockUser._id,
          email: mockUser.email,
          name: mockUser.name,
          picture: mockUser.picture,
        },
      };

      mockAuthService.login.mockResolvedValue(mockLoginResult);

      await controller.googleAuthRedirect(mockRequest, mockResponse);

      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        `http://localhost:3000/auth/success?token=${mockLoginResult.access_token}`,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const result = controller.getProfile(mockRequest);
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should return logout message', () => {
      const result = controller.logout();
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
