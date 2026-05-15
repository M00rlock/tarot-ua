import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { SpreadEntity } from './spread.entity';
import { SpreadsController } from './spreads.controller';
import { SpreadsService } from './spreads.service';

@Module({
  imports: [TypeOrmModule.forFeature([SpreadEntity]), AuthModule],
  controllers: [SpreadsController],
  providers: [SpreadsService]
})
export class SpreadsModule {}
