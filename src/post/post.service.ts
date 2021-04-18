import { Injectable } from '@nestjs/common';
import { PostRepository } from './repository/postRepository';

@Injectable()
export class PostService {
  constructor(private postRepository: PostRepository) {}
}
