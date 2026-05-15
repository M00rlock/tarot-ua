import { Controller, Get, Query } from '@nestjs/common';
import { TarotService } from './tarot.service';
import { SpreadType } from './tarot.types';

@Controller('tarot')
export class TarotController {
  constructor(private readonly tarotService: TarotService) {}

  @Get('cards')
  getCards(@Query('count') count?: number) {
    return this.tarotService.getAllCards(count ?? 78);
  }

  @Get('spreads')
  getSpreads() {
    return this.tarotService.getSpreadDefinitions();
  }

  @Get('draw')
  draw(@Query('count') count?: number, @Query('type') type?: SpreadType) {
    return this.tarotService.drawSpread(Number(count ?? 3), type);
  }

  @Get('card-of-day')
  cardOfDay(@Query('date') date?: string) {
    const parsed = date ? new Date(date) : new Date();
    const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    return this.tarotService.getCardOfDay(safeDate);
  }
}
