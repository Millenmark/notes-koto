import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

describe('NotesController', () => {
  let controller: NotesController;
  let notesService: NotesService;

  const mockUserId = new Types.ObjectId().toString();
  const mockNoteId = new Types.ObjectId().toString();

  const mockUser = {
    _id: mockUserId,
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockNote = {
    _id: mockNoteId,
    title: 'Test Note',
    content: 'Test content',
    userId: new Types.ObjectId(mockUserId),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequest = {
    user: mockUser,
  } as any;

  const mockNotesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        {
          provide: NotesService,
          useValue: mockNotesService,
        },
      ],
    }).compile();

    controller = module.get<NotesController>(NotesController);
    notesService = module.get<NotesService>(NotesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const createNoteDto: CreateNoteDto = {
        title: 'New Note',
        content: 'New content',
      };

      mockNotesService.create.mockResolvedValue(mockNote);

      const result = await controller.create(createNoteDto, mockRequest);

      expect(mockNotesService.create).toHaveBeenCalledWith(
        createNoteDto,
        mockUserId,
      );
      expect(result).toEqual(mockNote);
    });
  });

  describe('findAll', () => {
    it('should return all notes for the authenticated user', async () => {
      const mockNotes = [mockNote, { ...mockNote, _id: 'note2' }];
      mockNotesService.findAll.mockResolvedValue(mockNotes);

      const result = await controller.findAll(mockRequest);

      expect(mockNotesService.findAll).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockNotes);
    });
  });

  describe('findOne', () => {
    it('should return a specific note', async () => {
      mockNotesService.findOne.mockResolvedValue(mockNote);

      const result = await controller.findOne(mockNoteId, mockRequest);

      expect(mockNotesService.findOne).toHaveBeenCalledWith(
        mockNoteId,
        mockUserId,
      );
      expect(result).toEqual(mockNote);
    });
  });

  describe('update', () => {
    it('should update a note', async () => {
      const updateNoteDto: UpdateNoteDto = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const updatedNote = { ...mockNote, ...updateNoteDto };
      mockNotesService.update.mockResolvedValue(updatedNote);

      const result = await controller.update(
        mockNoteId,
        updateNoteDto,
        mockRequest,
      );

      expect(mockNotesService.update).toHaveBeenCalledWith(
        mockNoteId,
        updateNoteDto,
        mockUserId,
      );
      expect(result).toEqual(updatedNote);
    });
  });

  describe('remove', () => {
    it('should delete a note', async () => {
      mockNotesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockNoteId, mockRequest);

      expect(mockNotesService.remove).toHaveBeenCalledWith(
        mockNoteId,
        mockUserId,
      );
      expect(result).toBeUndefined();
    });
  });
});
