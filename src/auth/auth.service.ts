import { Injectable } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { SignupDto } from './dto/signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SigninDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interface/jwtPayload';

@Injectable()
export class AuthService {
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
}
