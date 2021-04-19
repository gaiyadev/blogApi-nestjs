import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['title'])
@Index(['id', 'title'])
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Index()
  id: number;

  @Column({ nullable: false, type: 'varchar' })
  title: string;

  @Column({ nullable: false, type: 'varchar' })
  body: string;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;
}
