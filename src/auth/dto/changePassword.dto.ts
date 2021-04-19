import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  @MaxLength(20)
  currentPassword: string;
  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak',
  })
  newPassword: string;
  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  @MaxLength(20)
  comfirmPassword: string;
}
