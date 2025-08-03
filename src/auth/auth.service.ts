import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(googleUser: any): Promise<UserDocument> {
    const { googleId, email, name, picture } = googleUser;

    let user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      user = new this.userModel({
        googleId,
        email,
        name,
        picture,
      });
      await user.save();
    } else if (user.googleId !== googleId) {
      user.googleId = googleId;
      user.name = name;
      user.picture = picture;
      await user.save();
    }

    return user;
  }

  async login(user: UserDocument) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    };
  }

  async validateUser(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }
}
