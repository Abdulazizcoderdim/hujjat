import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  second_name: string;

  @Column({ nullable: true })
  third_name: string;

  @Column({ nullable: true })
  full_name: string;

  @Column({ nullable: true })
  short_name: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true, unique: true })
  login: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true, unique: true })
  student_id_number: string;

  @Column({ nullable: true })
  university: string;

  @Column({ nullable: true })
  faculty: string;

  @Column({ nullable: true })
  group: string;

  @Column({ nullable: true })
  specialty: string;

  @Column({ nullable: true })
  semester: string;

  @Column({ nullable: true })
  level: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true, type: 'bigint' })
  birth_date: number;

  @Column({ nullable: true })
  address: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_blocked: boolean;

  @Column({ nullable: true, unique: true })
  googleId: string;

  @Column({ nullable: true })
  hash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
