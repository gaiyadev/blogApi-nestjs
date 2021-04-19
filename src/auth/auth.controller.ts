import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entity/user.entity';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorator/getAuthUser.decorator';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ForgotLinkDto } from './dto/forgotLink.dto';

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
    return await this.authService.signIn(signInDto);
  }

  @Put('/user')
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ): Promise<any> {
    return await this.authService.updateUser(user, updateUserDto);
  }

  //  Get user bu id
  @Get('/user')
  @UseGuards(AuthGuard())
  async getUserById(@GetUser() user: User): Promise<User> {
    return await this.authService.getUserById(user);
  }

  //  Change Password
  @Put('/changePassword')
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async changePassword(
    @GetUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    return await this.authService.changePassword(user, changePasswordDto);
  }

  //  Forgot Password
  @Post('/forgotPassword')
  @UsePipes(ValidationPipe)
  async forgotPasswordSentLink(
    @Body() forgotPasswordDto: ForgotLinkDto,
  ): Promise<User> {
    return await this.authService.forgotPasswordSentLink(forgotPasswordDto);
  }
}
