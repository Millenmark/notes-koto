import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from '../schemas/note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private noteModel: Model<NoteDocument>) {}

  async create(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    const note = new this.noteModel({
      ...createNoteDto,
      userId: new Types.ObjectId(userId),
    });
    return note.save();
  }

  async findAll(userId: string): Promise<Note[]> {
    return this.noteModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<Note> {
    const note = await this.noteModel.findById(id).exec();

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId.toString() !== userId) {
      throw new ForbiddenException('You can only access your own notes');
    }

    return note;
  }

  async update(
    id: string,
    updateNoteDto: UpdateNoteDto,
    userId: string,
  ): Promise<Note> {
    const note = await this.noteModel.findById(id).exec();

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own notes');
    }

    Object.assign(note, updateNoteDto);
    note.updatedAt = new Date();
    return note.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const note = await this.noteModel.findById(id).exec();

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own notes');
    }

    await this.noteModel.findByIdAndDelete(id).exec();
  }
}
