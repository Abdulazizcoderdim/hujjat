import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OtpType {
  EMAIL = 'email',
}

@Entity('otps')
@Index(['used', 'expiresAt'])
@Index(['email', 'used', 'expiresAt'])
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  email?: string;

  @Column({
    type: 'enum',
    enum: OtpType,
    default: OtpType.EMAIL,
  })
  type: OtpType;

  @Column({ unique: true })
  code: string;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ default: false })
  used: boolean;

  @Column({ nullable: true })
  usedAt?: Date;

  @Column({ nullable: true })
  expiredAt?: Date;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: false })
  expiredManually?: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
