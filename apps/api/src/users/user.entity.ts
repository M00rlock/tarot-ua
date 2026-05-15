import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SpreadEntity } from '../spreads/spread.entity';

export type PremiumTier = 'free' | 'premium';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'premium_tier', default: 'free' })
  premiumTier!: PremiumTier;

  @Column({ name: 'premium_until', type: 'timestamptz', nullable: true })
  premiumUntil!: Date | null;

  @OneToMany(() => SpreadEntity, (spread) => spread.user)
  spreads!: SpreadEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
