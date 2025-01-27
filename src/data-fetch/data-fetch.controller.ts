import { Body, Controller, Get, Logger, Post } from '@nestjs/common';

import Lang from '../constants/language';
import { DataFetchService } from './service/data-fetch.service';
import { FetchNewsInput } from './dto/input/fetch.news.input';
import { GetNewsResponse } from './dto/response/get.news.response';
import { MessageResponse } from './dto/response/message.response';
import { PaginationInput } from './dto/input/pagination.input';

@Controller('news')
export class DataFetchController {
  private readonly logger = new Logger('DataFetchController');

  constructor(private readonly dataFetchService: DataFetchService) {}

  /**
   * Fetches news data based on the provided query and saves it.
   * Logs the number of fetched and remaining posts during the process.
   *
   * @param {FetchNewsInput} - The input containing the query for fetching news data.
   * @returns {Promise<MessageResponse>} - A promise that resolves to a message response indicating the success of the operation.
   */
  @Post('fetch')
  async fetchAndSaveNewsData(
    @Body() { query }: FetchNewsInput,
  ): Promise<MessageResponse> {
    await this.dataFetchService.processDocuments(
      query,
      (fetchedCount, remainingCount) => {
        this.logger.log(`Fetched ${fetchedCount} posts.`);
        this.logger.log(`Remaining ${remainingCount} posts.`);
      },
    );

    return { message: Lang.NEWS_FETCHED_SUCCESSFULLY };
  }

  /**
   * Retrieves all news items based on the provided pagination input.
   *
   * @param paginationInput - The input object containing pagination details.
   * @returns A promise that resolves to a GetNewsResponse object containing the news items.
   */
  @Get('/all')
  async getAllNews(
    @Body() paginationInput: PaginationInput,
  ): Promise<GetNewsResponse> {
    return await this.dataFetchService.findAllNews(paginationInput);
  }
}
