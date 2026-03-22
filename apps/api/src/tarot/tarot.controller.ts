import { Controller, Get, Query } from '@nestjs/common';
import { TarotService } from './tarot.service';

@Controller('tarot')
export class TarotController {
  constructor(private readonly tarotService: TarotService) {}

  @Get('cards')
  getCards() {
    return this.tarotService.getAllCards();
  }

  @Get('draw')
  draw(@Query('count') count?: string) {
    const parsed = Number(count ?? 3);
    return this.tarotService.drawSpread(Number.isNaN(parsed) ? 3 : parsed);
  }

  @Get('card-of-day')
  cardOfDay(@Query('date') date?: string) {
    const parsed = date ? new Date(date) : new Date();
    const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    return this.tarotService.getCardOfDay(safeDate);
  }
}
