import { Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

export const createMockUser = (overrides = {}) => ({
  _id: new Types.ObjectId().toString(),
  email: 'test@example.com',
  googleId: 'googleId123',
  name: 'Test User',
  picture: 'https://example.com/picture.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
  save: jest.fn().mockResolvedValue(this),
  ...overrides,
});

export const createMockNote = (userId?: string, overrides = {}) => ({
  _id: new Types.ObjectId().toString(),
  title: 'Test Note',
  content: 'Test content',
  userId: new Types.ObjectId(userId || new Types.ObjectId().toString()),
  createdAt: new Date(),
  updatedAt: new Date(),
  save: jest.fn().mockResolvedValue(this),
  ...overrides,
});

export const createMockJwtService = () => ({
  sign: jest.fn().mockReturnValue('mockJwtToken'),
  verify: jest
    .fn()
    .mockReturnValue({ sub: 'mockUserId', email: 'test@example.com' }),
});

export const createMockUserModel = () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  constructor: jest.fn(),
  save: jest.fn(),
});

export const createMockNoteModel = () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  constructor: jest.fn(),
  save: jest.fn(),
});

export const createMockRequest = (user = createMockUser()) => ({
  user,
  headers: {
    authorization: 'Bearer mockJwtToken',
  },
});

export const createMockResponse = () => ({
  redirect: jest.fn(),
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
});

export const generateObjectId = () => new Types.ObjectId().toString();

export const createJwtToken = (payload: any) => {
  const jwtService = new JwtService({ secret: 'test-secret' });
  return jwtService.sign(payload);
};
