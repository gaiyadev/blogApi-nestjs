import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { SignupDto } from '../dto/signup.dto';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { SigninDto } from '../dto/signin.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  logger = new Logger('UserRepository');

  // signup Users
  async signUp(signUpDto: SignupDto): Promise<User> {
    const { email, password, username } = signUpDto;
    const saltOrRounds = await bcrypt.genSalt(12);

    const user = new User();
    user.username = username;
    user.email = email;
    user.password = await this.hashPassword(password, saltOrRounds);
    try {
      await user.save();
      this.logger.log('Saving user to Database');
      return user;
    } catch (err) {
      if (err.code === '23505') {
        this.logger.error('User already exist');
        throw new ConflictException('User already exist');
      }
      this.logger.error('Internal server error');
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
    const isMatch = await this.comparePassword(password, user.password);
    if (!isMatch) {
      this.logger.error('Password is not correct');
      throw new UnauthorizedException('Email or Password is not correct');
    }
    return user;
  }

  //  Hash password
  private async hashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  // Comparing user password
  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
