import { Module } from '@nestjs/common';
import { TarotController } from './tarot.controller';
import { TarotGraphService } from './tarot.graph.service';
import { TarotService } from './tarot.service';
import { LlmInterpretationService } from './llm-interpretation.service';

@Module({
  providers: [TarotGraphService, TarotService, LlmInterpretationService],
  controllers: [TarotController]
})
export class TarotModule {}
