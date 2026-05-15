import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtUserPayload } from '../auth/auth.types';
import { DrawnCard, SpreadInterpretation, SpreadType } from '../tarot/tarot.types';
import { SpreadsService } from './spreads.service';

@Controller('me/spreads')
@UseGuards(AuthGuard)
export class SpreadsController {
  constructor(private readonly spreadsService: SpreadsService) {}

  @Get()
  list(@CurrentUser() user: JwtUserPayload, @Query('favorite') favorite?: string) {
    return this.spreadsService.list(user.sub, favorite === undefined ? undefined : favorite === 'true');
  }

  @Post()
  create(
    @CurrentUser() user: JwtUserPayload,
    @Body() body: { title: string; spreadType: SpreadType; cards: DrawnCard[]; interpretation?: SpreadInterpretation | null; favorite?: boolean }
  ) {
    return this.spreadsService.create(user.sub, body);
  }

  @Patch(':id/favorite')
  favorite(@CurrentUser() user: JwtUserPayload, @Param('id') id: string, @Body() body: { favorite: boolean }) {
    return this.spreadsService.setFavorite(user.sub, id, body.favorite);
  }

  @Patch(':id/note')
  note(@CurrentUser() user: JwtUserPayload, @Param('id') id: string, @Body() body: { note: string }) {
    return this.spreadsService.setNote(user.sub, id, body.note ?? '');
  }
}
