import { Body, Controller, Get, Logger, Post } from '@nestjs/common';

import { FetchNewsInput } from './dto/input/fetch.news.input';
import { News } from './entities/news.entity';
import { DataFetchService } from './service/data-fetch.service';

@Controller('news')
export class DataFetchController {
  private readonly logger = new Logger('DataFetchController');

  constructor(private readonly dataFetchService: DataFetchService) {}

  @Post('fetch')
  async fetchAndSaveNewsData(@Body() { query }: FetchNewsInput) {
    await this.dataFetchService.fetchAndSaveNews(
      query,
      (fetchedCount, remainingCount) => {
        this.logger.log(`Fetched ${fetchedCount} posts.`);
        this.logger.log(`Remaining ${remainingCount} posts.`);
      },
    );

    return { message: 'News fetched and saved successfully.' };
  }

  @Get('all')
  async getAllNews(): Promise<News[]> {
    return await this.dataFetchService.findAllNews();
  }
}
