import { Module } from '@nestjs/common';
import { DataFetchService } from './service/data-fetch.service';
import { DataFetchController } from './data-fetch.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { HttpModule } from '@nestjs/axios';
import { QueryBuilderService } from 'src/utils/query.builder.service';
import { Thread } from './entities/thread.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([News]),
    HttpModule,
    TypeOrmModule.forFeature([Thread]),
  ],
  controllers: [DataFetchController],
  providers: [DataFetchService, QueryBuilderService],
})
export class DataFetchModule {}
