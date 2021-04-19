import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { CreateDateColumn } from 'typeorm';

export class UpdatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(22000)
  body: string;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @CreateDateColumn({ nullable: false })
  updatedAt: Date;
}
