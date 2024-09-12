import { Module } from '@nestjs/common';
import { BlobStorageController } from './blob-storage.controller';
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
  controllers: [BlobStorageController],
})
export class BlobStorageModule {}
