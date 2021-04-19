import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Roles } from '../enums/role.enum';
import { Gender } from '../enums/gender.enum';
import { Post } from '../../post/entity/post.entity';

@Entity()
@Unique(['email'])
@Index(['id', 'email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Index()
  id: number;

  @Column({ nullable: false, type: 'varchar' })
  username: string;

  @Column({ nullable: false, type: 'varchar' })
  @Index()
  email: string;

  @Column({ nullable: false, type: 'varchar' })
  password: string;

  @Column({ enum: Gender, nullable: false })
  gender: string;

  @Column({ enum: Roles, nullable: false, default: Roles.USER })
  role: string;

  @OneToMany((type) => Post, (post) => post.user, { eager: true })
  posts: Post[];

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true, type: 'varchar' })
  expiredAt: number;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;

  @BeforeInsert() beforeInsert = () => {
    this.email = this.email.toLowerCase();
  };
}
