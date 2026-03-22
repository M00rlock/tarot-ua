import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TarotModule } from './tarot/tarot.module';

@Module({
  imports: [TarotModule],
  controllers: [AppController]
})
export class AppModule {}
