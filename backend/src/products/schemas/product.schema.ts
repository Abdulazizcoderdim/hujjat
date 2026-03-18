import { Category } from 'src/category/schemas/category.schema';
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
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  fileUrl: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  pages?: number;

  @Column({ nullable: true })
  fileSize?: number;

  @Column()
  fileExt: string;

  @Column({ nullable: true })
  poster?: string;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.APPROVED,
  })
  status: ProductStatus;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column('text', { array: true, nullable: true })
  tags?: string[];

  @Column({ default: 0 })
  viewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
