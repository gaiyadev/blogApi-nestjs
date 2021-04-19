import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { SignupDto } from './dto/signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SigninDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interface/jwtPayload';
import { GetUser } from './decorator/getAuthUser.decorator';
import { User } from './entity/user.entity';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ForgotLinkDto } from './dto/forgotLink.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  logger = new Logger('AuthService');
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  // Sign up
  async signUp(signUpDto: SignupDto): Promise<any> {
    const user = await this.userRepository.signUp(signUpDto);
    return {
      user: { id: user.id, email: user.email, username: user.username },
      message: 'Account created successfully',
    };
  }

  // Sign in
  async signIn(signInDto: SigninDto): Promise<any> {
    const user = await this.userRepository.signIn(signInDto);
    if (!user) {
      return;
    }
    const { email, id, username } = user;
    const payload: JwtPayload = { email, id, username };

    const accessToken = await this.jwtService.sign(payload);
    return {
      accessToken,
      user: { id: user.id, email: user.email },
      message: 'Login  successfully',
    };
  }

  // updateUser
  async updateUser(
    @GetUser() user: User,
    updateUserDto: UpdateUserDto,
  ): Promise<User | any> {
    const { username, email } = updateUserDto;
    const getUser = await this.userRepository.findOne(user.id);
    if (!getUser) {
      throw new NotFoundException('User not found');
    }
    getUser.email = email;
    getUser.username = username;
    try {
      await getUser.save();
      return {
        user: {
          id: getUser.id,
          email: getUser.email,
          username: getUser.username,
          password: null,
        },
      };
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('User already exist');
      }
      throw new InternalServerErrorException();
    }
  }

  // Get user by Id
  async getUserById(user): Promise<User> {
    const found = await this.userRepository.findOne(user.id);
    if (!found) {
      throw new NotFoundException('User not found');
    }
    return found;
  }

  async changePassword(
    user: User,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User | any> {
    const found = await this.userRepository.changePassword(
      user,
      changePasswordDto,
    );
    if (!found) {
      throw new NotFoundException('User not found');
    }
    return { user: { id: found.id }, message: 'Password changed successfully' };
  }
  // Forgot password link
  async forgotPasswordSentLink(
    forgotPasswordDto: ForgotLinkDto,
  ): Promise<User | any> {
    const { email } = forgotPasswordDto;
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new NotFoundException('Email not found');
    }
    const cryptoToken = await randomBytes(20);
    user.resetToken = cryptoToken.toString('hex');
    try {
      await user.save();
      this.logger.log('Saving token and sent link');
      return {
        user: { email: user.email, id: user.id },
        message: 'Forgot password link sent successfully',
      };
    } catch (err) {
      this.logger.error('Error while saving token and sending');
      throw new InternalServerErrorException();
    }
  }
}
