import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { AxiosError } from 'axios';
import { Repository } from 'typeorm';
import { catchError, lastValueFrom } from 'rxjs';

import { News } from '../entities/news.entity';
import { NewsResponse } from '../dto/response/news.response';
import { PaginationInput } from '../dto/input/pagination.input';
import { QueryBuilderService } from '../../utils/query.builder.service';
import { QueryInput } from '../dto/input/fetch.news.input';
import Lang from '../../constants/language';

@Injectable()
export class DataFetchService {
  private readonly logger = new Logger(DataFetchService.name);

  constructor(
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly queryBuilderService: QueryBuilderService,
  ) {}

  async findAllNews({ page, limit }: PaginationInput): Promise<News[]> {
    const skip = (page - 1) * limit;

    return await this.newsRepository
      .createQueryBuilder('news')
      .skip(skip)
      .take(limit)
      .getMany();
  }

  async saveNews(news: { title: string; text: string }): Promise<News> {
    return await this.newsRepository.save(news);
  }

  // TODO: implement transaction
  // ! block: api hit reached limit
  async fetchAndSaveNews(
    query: QueryInput[],
    callback: (fetchedCount: number, remainingCount: number) => void,
  ) {
    // Fetching the API key from the environment variables
    const token = this.configService.get<string>('WEBZ_IO_API_KEY');

    if (!token) {
      this.logger.error(Lang.WEB_HOSE_API_KEY_NOT_FOUND);
      throw new InternalServerErrorException(Lang.WEB_HOSE_API_KEY_NOT_FOUND);
    }

    // Fetching the base URL from the environment variables
    const baseUrl = this.configService.get<string>('WEBZ_NEWS_URL');

    // Variable to keep track of the fetched news
    let fetchedNewsCount: number = 0;

    // Variable to keep track of the API response
    let moreResultsAvailable: number = 0;

    // Variable to keep track of the next URL
    let nextUrl: string | null = null;

    // Variable to keep track of the total results
    let totalResults: number = 0;

    // Building the query string
    const queryString = this.queryBuilderService.build(query);

    // First request URL
    const firstRequestUrl = `${baseUrl}?token=${token}&q=${queryString}`;

    do {
      try {
        // Fetching the data from the API
        const response = await lastValueFrom(
          this.httpService.get(nextUrl || firstRequestUrl).pipe(
            catchError((error: AxiosError) => {
              this.logger.error(Lang.API_HIT_ERROR, error);
              throw new InternalServerErrorException(error.message);
            }),
          ),
        );

        // Extracting the data from the response
        const data = response.data as NewsResponse;

        // Checking if the data is in the expected format
        if (data && Array.isArray(data.posts) && data.posts.length > 0) {
          const records = data.posts;

          for (const record of records) {
            const news = {
              ...record,
            };
            // Saving the news to the database
            await this.saveNews(news);
          }

          // Updating the variables
          nextUrl = data.next ? `${baseUrl}${data.next}` : null;
          moreResultsAvailable = data?.moreResultsAvailable;
          fetchedNewsCount += records.length;
          totalResults = data?.totalResults;
        } else {
          this.logger.error(Lang.UNEXPECTED_API_DATA_FORMAT, data);
          nextUrl = null;
          throw new InternalServerErrorException(
            Lang.UNEXPECTED_API_DATA_FORMAT,
          );
        }
      } catch (error) {
        this.logger.error(Lang.DATA_FETCH_ERROR, error.message);
        nextUrl = null;
        throw new InternalServerErrorException(error.message);
      }
    } while (
      moreResultsAvailable > 0 &&
      nextUrl &&
      totalResults !== fetchedNewsCount
    );

    // Callback to inform the caller about the fetched news count
    callback(fetchedNewsCount, totalResults - fetchedNewsCount);
  }
}
