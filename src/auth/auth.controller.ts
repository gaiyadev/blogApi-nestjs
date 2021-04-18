import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entity/user.entity';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Sign up
  @Post('/signup')
  @UsePipes(ValidationPipe)
  async signUp(@Body() signUpDto: SignupDto): Promise<User> {
    return await this.authService.signUp(signUpDto);
  }

  // Sign in
  @Post('/signin')
  @UsePipes(ValidationPipe)
  async signIn(@Body() signInDto: SigninDto): Promise<User> {
    return this.authService.signIn(signInDto);
  }
}
