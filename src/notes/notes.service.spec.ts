import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { Note, NoteDocument } from '../schemas/note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

describe('NotesService', () => {
  let service: NotesService;
  let noteModel: Model<NoteDocument>;

  const mockUserId = new Types.ObjectId().toString();
  const mockNoteId = new Types.ObjectId().toString();
  const mockOtherUserId = new Types.ObjectId().toString();

  const mockNote = {
    _id: mockNoteId,
    title: 'Test Note',
    content: 'Test content',
    userId: new Types.ObjectId(mockUserId),
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(this),
  };

  const mockNoteModel = {
    constructor: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: getModelToken(Note.name),
          useValue: mockNoteModel,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    noteModel = module.get<Model<NoteDocument>>(getModelToken(Note.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const createNoteDto: CreateNoteDto = {
        title: 'New Note',
        content: 'New content',
      };

      const mockNewNote = {
        ...createNoteDto,
        userId: new Types.ObjectId(mockUserId),
        save: jest.fn().mockResolvedValue({
          ...createNoteDto,
          _id: mockNoteId,
          userId: new Types.ObjectId(mockUserId),
        }),
      };

      jest
        .spyOn(noteModel, 'constructor' as any)
        .mockImplementation(() => mockNewNote);
      Object.setPrototypeOf(mockNewNote, noteModel.prototype);

      const result = await service.create(createNoteDto, mockUserId);

      expect(mockNewNote.save).toHaveBeenCalled();
      expect(result).toEqual({
        ...createNoteDto,
        _id: mockNoteId,
        userId: new Types.ObjectId(mockUserId),
      });
    });
  });

  describe('findAll', () => {
    it('should return all notes for a user', async () => {
      const mockNotes = [mockNote, { ...mockNote, _id: 'note2' }];

      mockNoteModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockNotes),
        }),
      });

      const result = await service.findAll(mockUserId);

      expect(mockNoteModel.find).toHaveBeenCalledWith({
        userId: new Types.ObjectId(mockUserId),
      });
      expect(result).toEqual(mockNotes);
    });
  });

  describe('findOne', () => {
    it('should return a note if user owns it', async () => {
      mockNoteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNote),
      });

      const result = await service.findOne(mockNoteId, mockUserId);

      expect(mockNoteModel.findById).toHaveBeenCalledWith(mockNoteId);
      expect(result).toEqual(mockNote);
    });

    it('should throw NotFoundException if note does not exist', async () => {
      mockNoteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(mockNoteId, mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own the note', async () => {
      const noteOwnedByOther = {
        ...mockNote,
        userId: new Types.ObjectId(mockOtherUserId),
      };

      mockNoteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(noteOwnedByOther),
      });

      await expect(service.findOne(mockNoteId, mockUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    const updateNoteDto: UpdateNoteDto = {
      title: 'Updated Title',
      content: 'Updated content',
    };

    it('should update a note if user owns it', async () => {
      const updatedNote = {
        ...mockNote,
        ...updateNoteDto,
        save: jest.fn().mockResolvedValue({
          ...mockNote,
          ...updateNoteDto,
        }),
      };

      mockNoteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedNote),
      });

      const result = await service.update(
        mockNoteId,
        updateNoteDto,
        mockUserId,
      );

      expect(mockNoteModel.findById).toHaveBeenCalledWith(mockNoteId);
      expect(updatedNote.save).toHaveBeenCalled();
      expect(result).toEqual({
        ...mockNote,
        ...updateNoteDto,
      });
    });

    it('should throw NotFoundException if note does not exist', async () => {
      mockNoteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update(mockNoteId, updateNoteDto, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the note', async () => {
      const noteOwnedByOther = {
        ...mockNote,
        userId: new Types.ObjectId(mockOtherUserId),
      };

      mockNoteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(noteOwnedByOther),
      });

      await expect(
        service.update(mockNoteId, updateNoteDto, mockUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a note if user owns it', async () => {
      mockNoteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNote),
      });
      mockNoteModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNote),
      });

      await service.remove(mockNoteId, mockUserId);

      expect(mockNoteModel.findById).toHaveBeenCalledWith(mockNoteId);
      expect(mockNoteModel.findByIdAndDelete).toHaveBeenCalledWith(mockNoteId);
    });

    it('should throw NotFoundException if note does not exist', async () => {
      mockNoteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(mockNoteId, mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own the note', async () => {
      const noteOwnedByOther = {
        ...mockNote,
        userId: new Types.ObjectId(mockOtherUserId),
      };

      mockNoteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(noteOwnedByOther),
      });

      await expect(service.remove(mockNoteId, mockUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
