import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DrawnCard, SpreadInterpretation, SpreadType } from '../tarot/tarot.types';
import { SpreadEntity } from './spread.entity';

@Injectable()
export class SpreadsService {
  constructor(@InjectRepository(SpreadEntity) private readonly spreads: Repository<SpreadEntity>) {}

  list(userId: string, favorite?: boolean) {
    return this.spreads.find({
      where: favorite === undefined ? { userId } : { userId, favorite },
      order: { createdAt: 'DESC' },
      take: 50
    });
  }

  async create(userId: string, body: { title: string; spreadType: SpreadType; cards: DrawnCard[]; interpretation?: SpreadInterpretation | null; favorite?: boolean }) {
    const spread = this.spreads.create({
      userId,
      title: body.title,
      spreadType: body.spreadType,
      cards: body.cards,
      interpretation: body.interpretation ?? null,
      favorite: body.favorite ?? false,
      note: null
    });

    return this.spreads.save(spread);
  }

  async setFavorite(userId: string, id: string, favorite: boolean) {
    await this.spreads.update({ id, userId }, { favorite });
    return this.spreads.findOneOrFail({ where: { id, userId } });
  }

  async setNote(userId: string, id: string, note: string) {
    await this.spreads.update({ id, userId }, { note });
    return this.spreads.findOneOrFail({ where: { id, userId } });
  }
}
