import { Category } from 'src/category/schemas/category.schema';
import { User } from 'src/users/schema/user.schema';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DISABLED = 'disabled',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  description: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ nullable: true })
  pages?: number;

  @Column({ nullable: true })
  fileSize?: number;

  @Column()
  fileExt: string;

  @Column({ nullable: true })
  poster?: string;

  @Column('text', { array: true, nullable: true })
  images?: string[];

  @Column()
  fileKey: string;

  @Column({ unique: true, nullable: true })
  fileHash?: string;

  @Column({ nullable: true })
  previewPdf?: string;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.PENDING,
  })
  status: ProductStatus;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column('text', { array: true, nullable: true })
  tags?: string[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  soldCount: number;

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column({ nullable: true })
  approvedAt?: Date;

  @Column({ nullable: true })
  rejectedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'moderated_by' })
  moderatedBy?: User;

  @Column({ nullable: true })
  moderatorNote?: string;

  @Column({ default: true })
  isLegal?: boolean;

  @Column({ nullable: true })
  illegalReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
