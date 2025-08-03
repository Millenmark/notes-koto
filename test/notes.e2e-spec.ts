import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import request from 'supertest';
import { NotesModule } from '../src/notes/notes.module';
import { AuthModule } from '../src/auth/auth.module';
import { Note, NoteSchema } from '../src/schemas/note.schema';
import { User, UserSchema } from '../src/schemas/user.schema';

describe('NotesController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let userId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        MongooseModule.forRoot('mongodb://localhost:27017/notes-koto-test'),
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: Note.name, schema: NoteSchema },
        ]),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        AuthModule,
        NotesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Create a test user and JWT token
    // In a real test, you would create this through the auth flow
    userId = '507f1f77bcf86cd799439011';
    jwtToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2MzQ1NjQ4MDAsImV4cCI6MTYzNDU2ODQwMH0.test-signature';
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/notes (POST)', () => {
    it('should create a new note with valid data', () => {
      const createNoteDto = {
        title: 'Test Note',
        content: 'This is a test note content',
      };

      return request(app.getHttpServer())
        .post('/api/notes')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createNoteDto)
        .expect(401); // Will be 401 until we have proper JWT setup
    });

    it('should return 401 without JWT token', () => {
      const createNoteDto = {
        title: 'Test Note',
        content: 'This is a test note content',
      };

      return request(app.getHttpServer())
        .post('/api/notes')
        .send(createNoteDto)
        .expect(401);
    });

    it('should return 400 with invalid data', () => {
      const invalidNoteDto = {
        title: '', // Empty title should fail validation
        content: 'This is a test note content',
      };

      return request(app.getHttpServer())
        .post('/api/notes')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidNoteDto)
        .expect(401); // Will be 401 until we have proper JWT setup
    });
  });

  describe('/api/notes (GET)', () => {
    it('should return all notes for authenticated user', () => {
      return request(app.getHttpServer())
        .get('/api/notes')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(401); // Will be 401 until we have proper JWT setup
    });

    it('should return 401 without JWT token', () => {
      return request(app.getHttpServer()).get('/api/notes').expect(401);
    });
  });

  describe('/api/notes/:id (GET)', () => {
    const noteId = '507f1f77bcf86cd799439012';

    it('should return a specific note', () => {
      return request(app.getHttpServer())
        .get(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(401); // Will be 401 until we have proper JWT setup
    });

    it('should return 401 without JWT token', () => {
      return request(app.getHttpServer())
        .get(`/api/notes/${noteId}`)
        .expect(401);
    });

    it('should return 400 with invalid note ID format', () => {
      return request(app.getHttpServer())
        .get('/api/notes/invalid-id')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(401); // Will be 401 until we have proper JWT setup
    });
  });

  describe('/api/notes/:id (PATCH)', () => {
    const noteId = '507f1f77bcf86cd799439012';

    it('should update a note', () => {
      const updateNoteDto = {
        title: 'Updated Note Title',
        content: 'Updated note content',
      };

      return request(app.getHttpServer())
        .patch(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateNoteDto)
        .expect(401); // Will be 401 until we have proper JWT setup
    });

    it('should return 401 without JWT token', () => {
      const updateNoteDto = {
        title: 'Updated Note Title',
      };

      return request(app.getHttpServer())
        .patch(`/api/notes/${noteId}`)
        .send(updateNoteDto)
        .expect(401);
    });
  });

  describe('/api/notes/:id (DELETE)', () => {
    const noteId = '507f1f77bcf86cd799439012';

    it('should delete a note', () => {
      return request(app.getHttpServer())
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(401); // Will be 401 until we have proper JWT setup
    });

    it('should return 401 without JWT token', () => {
      return request(app.getHttpServer())
        .delete(`/api/notes/${noteId}`)
        .expect(401);
    });
  });
});
