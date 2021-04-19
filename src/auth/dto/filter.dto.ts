import { IsNotEmpty, IsOptional } from 'class-validator';

export class FilterDto {
  @IsNotEmpty()
  @IsOptional()
  id: number;

  @IsNotEmpty()
  @IsOptional()
  email: string;

  @IsNotEmpty()
  @IsOptional()
  username: string;
}
