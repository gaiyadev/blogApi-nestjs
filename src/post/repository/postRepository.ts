import { EntityRepository, Repository } from 'typeorm';
import { Post } from '../entity/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { User } from '../../auth/entity/user.entity';
import { FilterDto } from '../dto/filter.dto';

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
  logger = new Logger('PostRepository');
  async addPost(postDto: CreatePostDto, user: User): Promise<any> {
    const { title, body } = postDto;
    const post = new Post();
    post.title = title;
    post.body = body;
    post.user = user;
    try {
      this.logger.log('Saving Post');
      return await post.save();
    } catch (err) {
      if (err.code === '23505') {
        this.logger.error('Post with the same title already exist');
        throw new ConflictException('Post with the same title already exist');
      }
      this.logger.error(`Internal server error ${err.stack}`);
      throw new InternalServerErrorException();
    }
  }

  //  getAllPost
  async getAllPost(user: User, filterDto: FilterDto): Promise<Post[] | any> {
    const { title, body } = filterDto;
    const query = this.createQueryBuilder('post');
    query.where('post.userId= :userId', { userId: user.id });

    if (title) {
      query.andWhere('post.title = :title', { title });
    }

    if (body) {
      query.andWhere('(post.title LIKE :body OR post.body LIKE :body)', {
        body: `%${body}%`,
      });
    }

    try {
      return await query.getMany();
    } catch (e) {
      this.logger.error(`Internal server error ${e.stack}`);
      throw new InternalServerErrorException();
    }
  }
}
