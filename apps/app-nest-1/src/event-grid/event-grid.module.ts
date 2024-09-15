import { Module } from '@nestjs/common';
import { EventGridController } from './event-grid.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      // No need to import in other modules
      isGlobal: true,
      expandVariables: true,
      // cache: true,
    }),
  ],
  controllers: [EventGridController],
})
export class EventGridModule {}
