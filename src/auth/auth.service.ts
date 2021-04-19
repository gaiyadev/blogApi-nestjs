import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
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
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { FilterDto } from "./dto/filter.dto";

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
    const { email, id, username, role } = user;
    const payload: JwtPayload | any = { email, id, username, role };

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
      this.logger.error(`Internal Server error ${err.stack}`);
      throw new InternalServerErrorException();
    }
  }

  // Get user by Id
  async getUserById(user): Promise<User | any> {
    const found = await this.userRepository.findOne(user.id);
    if (!found) {
      throw new NotFoundException('User not found');
    }
    return {
      user: {
        id: found.id,
        email: found.email,
        username: found.username,
        gender: found.gender,
        password: null,
        role: found.role,
      },
    };
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
      throw new NotFoundException('No account associated with tis email');
    }

    this.logger.log('Generating tokens');
    const cryptoToken = await randomBytes(25);
    const sent = cryptoToken.toString('hex');
    const expireTime = Date.now() + 360000;

    user.resetToken = sent;
    user.expiredAt = expireTime;

    try {
      await user.save();
      this.logger.log('Saving token and sent link');
      return {
        sent,
        user: { email: user.email, id: user.id },
        message: 'Forgot password link sent successfully',
      };
    } catch (err) {
      this.logger.error(`Error while saving token and sending ${err.stack}`);
      throw new InternalServerErrorException();
    }
  }

  //  Reset password
  async resetPassword(
    token: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<User | any> {
    if (!token) {
      throw new UnauthorizedException();
    }
    const user = await this.userRepository.resetPassword(
      token,
      resetPasswordDto,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      message: 'Password reset successfully',
    };
  }

  //  getAllUser
  async getAllUsers(filterDto: FilterDto): Promise<User[]> {
    return await this.userRepository.getAllUsers(filterDto);
  }
}
