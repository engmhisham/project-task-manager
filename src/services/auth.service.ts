import jwt from 'jsonwebtoken';
import { User } from '../models';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';
import { RegisterInput, LoginInput } from '../validation/auth.validation';

export class AuthService {
  static async register(data: RegisterInput) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const user = await User.create(data);
    const token = AuthService.generateToken(user);

    return { user, token };
  }

  static async login(data: LoginInput) {
    const user = await User.findOne({ email: data.email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = AuthService.generateToken(user);

    // Remove password from response
    const userObj = user.toJSON();

    return { user: userObj, token };
  }

  private static generateToken(user: { _id: unknown; email: string; role: string }): string {
    return jwt.sign(
      {
        id: String(user._id),
        email: user.email,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );
  }
}
