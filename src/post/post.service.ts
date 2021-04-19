import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PostRepository } from './repository/postRepository';
import { Post } from './entity/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../auth/entity/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterDto } from './dto/filter.dto';

@Injectable()
export class PostService {
  constructor(private postRepository: PostRepository) {}
  logger = new Logger('PostService');
  async addPost(postDto: CreatePostDto, user: User): Promise<Post | any> {
    const post = await this.postRepository.addPost(postDto, user);
    if (!post) {
      return;
    }
    return {
      post: {
        id: post.id,
        title: post.title,
        body: post.body,
      },
      user: {
        id: post.user.id,
        userId: post.userId,
      },
      message: 'Post created successfully',
    };
  }

  //  getPostById
  async getPostById(id, user: User): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id, userId: user.id },
    });
    if (!post) {
      throw new NotFoundException(`Task with Id "${id}" not found`);
    }
    return post;
  }

  //  Delete by id
  async deletePostById(id: number, user: User): Promise<Post | any> {
    const post = await this.postRepository.delete({ id, userId: user.id });

    if (post.affected === 0) {
      throw new NotFoundException(`Post with Id "${id}" not found`);
    }
    return { message: 'Post deleted successfully' };
  }
  //  Update Post by id
  async updatePostById(
    id: number,
    user: User,
    updatePostDto: UpdatePostDto,
  ): Promise<Post | any> {
    const post = await this.getPostById(id, user);
    const { title, body } = updatePostDto;
    post.title = title;
    post.body = body;
    try {
      this.logger.log('Updating Post');
      const savePost = await post.save();
      return {
        savePost,
        message: 'Post updated successfully',
      };
    } catch (err) {
      if (err.code === '23505') {
        this.logger.error('Post with the same title already exist');
        throw new ConflictException('Post with the same title already exist');
      }
      this.logger.error(`Internal server error ${err.stack}`);
      throw new InternalServerErrorException();
    }
  }

  //  All Post
  async getAllPost(user: User, filterDto: FilterDto): Promise<Post[]> {
    return await this.postRepository.getAllPost(user, filterDto);
  }
}
