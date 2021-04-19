import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetUser } from '../auth/decorator/getAuthUser.decorator';
import { User } from '../auth/entity/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterDto } from './dto/filter.dto';

@Controller('post')
@UseGuards(AuthGuard())
export class PostController {
  constructor(private postService: PostService) {}

  @Post('/add')
  @UsePipes(ValidationPipe)
  async addPost(
    @GetUser() user: User,
    @Body() postDto: CreatePostDto,
  ): Promise<any> {
    return await this.postService.addPost(postDto, user);
  }

  // Post by Id
  @Get('/:id')
  async getPostById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<any> {
    return await this.postService.getPostById(id, user);
  }

  //  deletePostById
  @Delete('/:id')
  async deletePostById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<any> {
    return await this.postService.deletePostById(id, user);
  }
  //  updatePostById
  @Put('/:id')
  @UsePipes(ValidationPipe)
  async updatePostById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<any> {
    return await this.postService.updatePostById(id, user, updatePostDto);
  }

  //  getAllPost
  @Get('/post/all')
  async getAllPost(
    @Query(ValidationPipe) filterDto: FilterDto,
    @GetUser() user: User,
  ): Promise<any> {
    return await this.postService.getAllPost(user, filterDto);
  }
}
