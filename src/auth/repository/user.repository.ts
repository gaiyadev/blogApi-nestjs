import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { SignupDto } from '../dto/signup.dto';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SigninDto } from '../dto/signin.dto';
import { ChangePasswordDto } from '../dto/changePassword.dto';
import { ResetPasswordDto } from '../dto/resetPassword.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  logger = new Logger('UserRepository');

  // signup Users
  async signUp(signUpDto: SignupDto): Promise<User> {
    const { email, password, username, gender } = signUpDto;
    const saltOrRounds = await bcrypt.genSalt(12);

    const user = new User();
    user.username = username;
    user.email = email;
    user.gender = gender;
    user.password = await UserRepository.hashPassword(password, saltOrRounds);
    try {
      await user.save();
      this.logger.log('Saving user to Database');
      return user;
    } catch (err) {
      if (err.code === '23505') {
        this.logger.error('User already exist');
        throw new ConflictException('User already exist');
      }
      this.logger.error(`Internal server error ${err.stack}`);
      throw new InternalServerErrorException();
    }
  }

  // Sign in users
  async signIn(signInDto: SigninDto): Promise<User> {
    const { email, password } = signInDto;
    const user = await this.findOne({ email });
    if (!user) {
      this.logger.error('Email is not correct');
      throw new UnauthorizedException('Email or Password is not correct');
    }
    const isMatch = await UserRepository.comparePassword(
      password,
      user.password,
    );
    if (!isMatch) {
      this.logger.error('Password is not correct');
      throw new UnauthorizedException('Email or Password is not correct');
    }
    return user;
  }

  // changePassword
  async changePassword(
    user,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    const { comfirmPassword, newPassword, currentPassword } = changePasswordDto;
    const saltOrRounds = await bcrypt.genSalt(12);
    const found = await this.findOne(user.id);
    if (!found) {
      throw new NotFoundException('User not found');
    }
    const isMatch = await UserRepository.comparePassword(
      currentPassword,
      found.password,
    );
    if (!isMatch) {
      this.logger.error('Current Password is not correct');
      throw new UnauthorizedException('Current Password is not correct');
    }
    const isSame = await UserRepository.comparePassword(
      newPassword,
      found.password,
    );
    if (isSame) {
      this.logger.error(
        'New password cannot be the same with Current Password',
      );
      throw new UnauthorizedException(
        'New password cannot be the same with Current Password',
      );
    }
    if (newPassword !== comfirmPassword) {
      throw new BadRequestException(
        'New password must be the same with confirm password',
      );
    }
    found.password = await UserRepository.hashPassword(
      newPassword,
      saltOrRounds,
    );
    try {
      await found.save();
      this.logger.log('Saving new Password');
      return found;
    } catch (e) {
      this.logger.error(`Internal server error ${e.stack}`);
      throw new InternalServerErrorException();
    }
  }

  //  Reset password
  async resetPassword(
    token: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<any> {
    const { newPassword, confirmPassword } = resetPasswordDto;
    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'New Password must be same with confirm password',
      );
    }
    const user = await this.findOne({ where: { resetToken: token } });
    if (!user) {
      this.logger.error('user not found');
      throw new UnauthorizedException();
    }
    const isTokenExpired = user.expiredAt;
    if (isTokenExpired > Date.now()) {
      this.logger.error('Token expired');
      throw new UnauthorizedException('Sorry, Token expired');
    }
    const saltOrRounds = await bcrypt.genSalt(12);
    user.password = await UserRepository.hashPassword(
      newPassword,
      saltOrRounds,
    );
    try {
      await user.save();
      return user;
    } catch (err) {
      this.logger.error(`Internal server error ${err.stack}`);
      throw new InternalServerErrorException();
    }
  }
  //  Hash password
  private static async hashPassword(
    password: string,
    salt: string,
  ): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  // Comparing user password
  private static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
