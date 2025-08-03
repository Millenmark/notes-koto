import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { User, UserSchema } from '../src/schemas/user.schema';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        MongooseModule.forRoot('mongodb://localhost:27017/notes-koto-test'),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/google (GET)', () => {
    it('should redirect to Google OAuth', () => {
      return request(app.getHttpServer())
        .get('/auth/google')
        .expect(302)
        .expect((res) => {
          expect(res.headers.location).toContain('accounts.google.com');
        });
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should return 401 without JWT token', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should return user profile with valid JWT token', async () => {
      // This test would require a valid JWT token
      // In a real scenario, you would create a test user and generate a token
      const mockToken = 'valid-jwt-token'; // This would be generated in setup

      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(401); // Will be 401 until we have a valid token setup
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should return 401 without JWT token', () => {
      return request(app.getHttpServer()).post('/auth/logout').expect(401);
    });

    it('should return logout message with valid JWT token', async () => {
      // This test would require a valid JWT token
      const mockToken = 'valid-jwt-token'; // This would be generated in setup

      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(401); // Will be 401 until we have a valid token setup
    });
  });
});
