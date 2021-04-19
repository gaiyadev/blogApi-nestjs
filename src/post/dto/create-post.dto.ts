import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { CreateDateColumn } from 'typeorm';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(12000)
  body: string;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @CreateDateColumn({ nullable: false })
  updatedAt: Date;
}
