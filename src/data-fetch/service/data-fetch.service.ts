import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { lastValueFrom } from 'rxjs';
import { DataSource, QueryRunner, Repository } from 'typeorm';

import Lang from 'src/constants/language';
import { GetNewsResponse } from '../dto/response/get.news.response';
import { News } from '../entities/news.entity';
import { NewsPost, NewsResponse } from '../dto/response/news.response';
import { PaginationInput } from '../dto/input/pagination.input';
import { QueryBuilderService } from 'src/utils/query.builder.service';
import { QueryInput } from '../dto/input/fetch.news.input';

@Injectable()
export class DataFetchService {
  private readonly logger = new Logger(DataFetchService.name);

  constructor(
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly queryBuilderService: QueryBuilderService,
    private readonly dataSource: DataSource,
  ) {}

  async findAllNews({
    page,
    limit,
  }: PaginationInput): Promise<GetNewsResponse> {
    const skip = (page - 1) * limit;

    const [news, total] = await this.newsRepository.findAndCount({
      skip,
      take: limit,
    });

    // calculate total page
    const totalPage = Math.ceil(total / limit);

    return { message: Lang.SUCCESS, posts: news, totalPage };
  }

  async processDocuments(
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

    // Variable to keep track of the next URL
    let nextUrl: string | null = null;

    // Variable to keep track of the total results
    let totalNews: number = 0;

    // Building the query string
    const queryString = this.queryBuilderService.build(query);

    // First request URL
    const firstRequestUrl = `${baseUrl}/newsApiLite?token=${token}&q=${queryString}`;

    //  Get the DataSource instance for transaction management
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();

    // Establish connection and start a transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      do {
        const data = await this.fetchDocumentsFromApi(
          nextUrl || firstRequestUrl,
        );

        const posts = data.posts;

        if (posts.length === 0) {
          this.logger.log(Lang.NO_MORE_POSTS);
          break;
        }

        await this.savePostToDatabase(posts, queryRunner);

        nextUrl = data.next ? `${baseUrl}${data.next}` : null;

        if (nextUrl === null) {
          break;
        }

        fetchedNewsCount += posts.length;
        totalNews = data?.totalResults;
      } while (fetchedNewsCount !== totalNews);

      // Commit the transaction after successfully saving all posts
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback the transaction in case of any error
      await queryRunner.rollbackTransaction();

      this.logger.error(Lang.TRANSACTION_FAILED, error.message);

      throw new InternalServerErrorException(
        Lang.UNEXPECTED_API_DATA_FORMAT,
        error.message,
      );
    } finally {
      await queryRunner.release();
    }

    const remainingNewsCount = totalNews - fetchedNewsCount;

    callback(fetchedNewsCount, remainingNewsCount);
  }

  // to fetch api
  // return NewsPost[]
  async fetchDocumentsFromApi(apiUrl: string) {
    try {
      const response = await lastValueFrom(this.httpService.get(apiUrl));

      return response.data as NewsResponse;
    } catch (error) {
      this.logger.error(`Error fetching data from API: ${error.message}`);

      throw new InternalServerErrorException(
        `Error fetching data from API: ${error.message}`,
      );
    }
  }

  async savePostToDatabase(posts: NewsPost[], queryRunner: QueryRunner) {
    try {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(News)
        .values(posts)
        .execute();

      this.logger.log(`${posts.length} documents saved successfully.`);
    } catch (error) {
      this.logger.error(
        `Error saving documents to the database: ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Error saving documents to the database: ${error.message}`,
      );
    }
  }
}
