import { Product } from 'src/products/schemas/product.schema';
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

@Entity('student_books')
export class StudentBook {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @ManyToOne(() => Product, (product) => product.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  product_id: number;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'int', default: 0 })
  lastPage: number;

  @Column({ default: false })
  isFinished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
