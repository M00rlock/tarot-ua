import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedSpreadEntity } from './shared-spread.entity';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';

@Module({
  imports: [TypeOrmModule.forFeature([SharedSpreadEntity])],
  controllers: [ShareController],
  providers: [ShareService]
})
export class ShareModule {}
