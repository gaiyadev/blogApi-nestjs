import { IsNotEmpty, IsOptional } from 'class-validator';

export class FilterDto {
  @IsNotEmpty()
  @IsOptional()
  title: number;

  @IsNotEmpty()
  @IsOptional()
  body: string;
}
