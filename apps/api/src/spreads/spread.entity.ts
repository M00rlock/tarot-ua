import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { DrawnCard, SpreadInterpretation, SpreadType } from '../tarot/tarot.types';

@Entity('user_spreads')
export class SpreadEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ name: 'spread_type', type: 'varchar', length: 50 })
  spreadType!: SpreadType;

  @Column({ type: 'jsonb' })
  cards!: DrawnCard[];

  @Column({ type: 'jsonb', nullable: true })
  interpretation!: SpreadInterpretation | null;

  @Column({ default: false })
  favorite!: boolean;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @ManyToOne(() => UserEntity, (user) => user.spreads, { onDelete: 'CASCADE' })
  user!: UserEntity;

  @Column({ name: 'user_id' })
  userId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
