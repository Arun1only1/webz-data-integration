import { Body, Controller, Get, Logger, Post } from '@nestjs/common';

import { FetchNewsInput } from './dto/input/fetch.news.input';
import { PaginationInput } from './dto/input/pagination.input';
import { GetNewsResponse } from './dto/response/get.news.response';
import { MessageResponse } from './dto/response/message.response';
import { DataFetchService } from './service/data-fetch.service';

@Controller('news')
export class DataFetchController {
  private readonly logger = new Logger('DataFetchController');

  constructor(private readonly dataFetchService: DataFetchService) {}

  @Post('fetch')
  async fetchAndSaveNewsData(
    @Body() { query }: FetchNewsInput,
  ): Promise<MessageResponse> {
    await this.dataFetchService.fetchAndSaveNews(
      query,
      (fetchedCount, remainingCount) => {
        this.logger.log(`Fetched ${fetchedCount} posts.`);
        this.logger.log(`Remaining ${remainingCount} posts.`);
      },
    );

    return { message: 'News fetched and saved successfully.' };
  }

  @Get('/all')
  async getAllNews(
    @Body() paginationInput: PaginationInput,
  ): Promise<GetNewsResponse> {
    const posts = await this.dataFetchService.findAllNews(paginationInput);

    return { message: 'success', posts };
  }
}
