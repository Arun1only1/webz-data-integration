import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, lastValueFrom } from 'rxjs';
import { QueryBuilderService } from 'src/utils/query.builder.service';
import { Repository } from 'typeorm';
import { AxiosError } from 'axios';
import { NewsResponse } from '../dto/news.response';
import { News } from '../entities/news.entity';
import { QueryInput } from '../dto/input/fetch.news.input';

@Injectable()
export class DataFetchService {
  private readonly logger = new Logger(DataFetchService.name);
  constructor(
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly queryBuilderService: QueryBuilderService,
  ) {}

  async findAllNews(): Promise<News[]> {
    return await this.newsRepository.find();
  }

  async saveNews(news: { title: string; text: string }): Promise<News> {
    return await this.newsRepository.save(news);
  }

  async fetchAndSaveNews(
    query: QueryInput[],
    callback: (fetchedCount: number, remainingCount: number) => void,
  ) {
    // Fetching the API key from the environment variables
    const token = this.configService.get<string>('WEBZ_IO_API_KEY');

    if (!token) {
      this.logger.error('Web hose API Key not found');
      return;
    }

    // Fetching the base URL from the environment variables
    const baseUrl = this.configService.get<string>('WEBZ_NEWS_URL');

    // Variables to keep track of the fetched news
    let fetchedNewsCount: number = 0;

    // Variables to keep track of the API response
    let moreResultsAvailable: number = 0;

    // Variables to keep track of the next URL
    let nextUrl: string | null = null;

    // Variables to keep track of the total results
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
              this.logger.error('API Hit Error:', error);
              throw error;
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
          this.logger.error('Unexpected API response format:', data);
          nextUrl = null;
        }
      } catch (error) {
        this.logger.error('Error fetching data:', error);
        nextUrl = null;
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
