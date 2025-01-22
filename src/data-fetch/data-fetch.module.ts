import { Module } from '@nestjs/common';
import { DataFetchService } from './data-fetch.service';
import { DataFetchController } from './data-fetch.controller';

@Module({
  controllers: [DataFetchController],
  providers: [DataFetchService],
})
export class DataFetchModule {}
