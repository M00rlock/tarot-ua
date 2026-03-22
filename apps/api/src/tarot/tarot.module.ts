import { Module } from '@nestjs/common';
import { TarotController } from './tarot.controller';
import { TarotGraphService } from './tarot.graph.service';
import { TarotService } from './tarot.service';

@Module({
  providers: [TarotGraphService, TarotService],
  controllers: [TarotController]
})
export class TarotModule {}
