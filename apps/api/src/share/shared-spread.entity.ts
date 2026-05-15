import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DrawnCard, SpreadInterpretation, SpreadType } from '../tarot/tarot.types';

@Entity('shared_spreads')
export class SharedSpreadEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 12 })
  slug!: string;

  @Column()
  title!: string;

  @Column({ name: 'spread_type', type: 'varchar', length: 50 })
  spreadType!: SpreadType;

  @Column({ type: 'jsonb' })
  cards!: DrawnCard[];

  @Column({ type: 'jsonb', nullable: true })
  interpretation!: SpreadInterpretation | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
