import { Body, Controller, Get, Header, Headers, Param, Post } from '@nestjs/common';
import { DrawnCard, SpreadInterpretation, SpreadType } from '../tarot/tarot.types';
import { ShareService } from './share.service';

@Controller('share/spreads')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post()
  create(
    @Body() body: { title: string; spreadType: SpreadType; cards: DrawnCard[]; interpretation?: SpreadInterpretation | null },
    @Headers('origin') origin?: string
  ) {
    return this.shareService.create(body, origin);
  }

  @Get(':slug')
  async get(@Param('slug') slug: string, @Headers('origin') origin?: string) {
    const spread = await this.shareService.findBySlug(slug);
    return this.shareService.toShareResponse(spread, origin);
  }

  @Get(':slug/social-card.svg')
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=86400')
  async socialCard(@Param('slug') slug: string) {
    const spread = await this.shareService.findBySlug(slug);
    return this.shareService.renderSocialCardSvg(spread);
  }
}
