import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotLinkDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
