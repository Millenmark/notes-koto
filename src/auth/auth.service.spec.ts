import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from './auth.service';
import { User, UserDocument } from '../schemas/user.schema';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: Model<UserDocument>;
  let jwtService: JwtService;

  const mockUser = {
    _id: 'mockUserId',
    email: 'test@example.com',
    googleId: 'googleId123',
    name: 'Test User',
    picture: 'https://example.com/picture.jpg',
    save: jest.fn().mockResolvedValue(this),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    constructor: jest.fn().mockResolvedValue(mockUser),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockJwtToken'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateGoogleUser', () => {
    const googleUser = {
      googleId: 'googleId123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/picture.jpg',
    };

    it('should create a new user if user does not exist', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const mockNewUser = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(mockUser),
      };

      // Mock the constructor to return our mock user
      jest
        .spyOn(userModel, 'constructor' as any)
        .mockImplementation(() => mockNewUser);
      Object.setPrototypeOf(mockNewUser, userModel.prototype);

      const result = await service.validateGoogleUser(googleUser);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: googleUser.email,
      });
      expect(mockNewUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return existing user if user exists and googleId matches', async () => {
      const existingUser = { ...mockUser, googleId: 'googleId123' };
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      });

      const result = await service.validateGoogleUser(googleUser);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: googleUser.email,
      });
      expect(result).toEqual(existingUser);
    });

    it('should update existing user if googleId differs', async () => {
      const existingUser = {
        ...mockUser,
        googleId: 'oldGoogleId',
        save: jest.fn().mockResolvedValue(mockUser),
      };
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      });

      const result = await service.validateGoogleUser(googleUser);

      expect(existingUser.googleId).toBe(googleUser.googleId);
      expect(existingUser.name).toBe(googleUser.name);
      expect(existingUser.picture).toBe(googleUser.picture);
      expect(existingUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const result = await service.login(mockUser as any);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser._id,
      });
      expect(result).toEqual({
        access_token: 'mockJwtToken',
        user: {
          id: mockUser._id,
          email: mockUser.email,
          name: mockUser.name,
          picture: mockUser.picture,
        },
      });
    });
  });

  describe('validateUser', () => {
    it('should return user if found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.validateUser('mockUserId');

      expect(mockUserModel.findById).toHaveBeenCalledWith('mockUserId');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.validateUser('nonexistentId');

      expect(mockUserModel.findById).toHaveBeenCalledWith('nonexistentId');
      expect(result).toBeNull();
    });
  });
});
