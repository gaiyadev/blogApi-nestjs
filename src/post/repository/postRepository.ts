import { EntityRepository, Repository } from 'typeorm';
import { Post } from '../entity/post.entity';
import { User } from '../../auth/entity/user.entity';

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {}
