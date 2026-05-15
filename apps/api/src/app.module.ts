import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { SpreadsModule } from './spreads/spreads.module';
import { SpreadEntity } from './spreads/spread.entity';
import { TarotModule } from './tarot/tarot.module';
import { UserEntity } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      username: process.env.POSTGRES_USER ?? 'tarot',
      password: process.env.POSTGRES_PASSWORD ?? 'tarot',
      database: process.env.POSTGRES_DB ?? 'tarot',
      entities: [UserEntity, SpreadEntity],
      synchronize: process.env.TYPEORM_SYNC !== 'false'
    }),
    AuthModule,
    SpreadsModule,
    TarotModule
  ],
  controllers: [AppController]
})
export class AppModule {}
