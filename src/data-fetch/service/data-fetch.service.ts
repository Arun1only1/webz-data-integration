import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import { lastValueFrom } from 'rxjs';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { NewsPost } from './../dto/response/news.response';

import Lang from 'src/constants/language';
import { QueryBuilderService } from 'src/utils/query.builder.service';
import { QueryInput } from '../dto/input/fetch.news.input';
import { PaginationInput } from '../dto/input/pagination.input';
import { GetNewsResponse } from '../dto/response/get.news.response';
import { NewsResponse } from '../dto/response/news.response';
import { News } from '../entities/news.entity';

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

    console.log({ firstRequestUrl });
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
        await this.writeDataToJSON(posts);

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
        .orIgnore()
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

  async writeDataToJSON(newsData: NewsPost[]) {
    try {
      const filePath = '/app/data/data.json'; // Path inside the container
      let existingData: NewsPost[] = [];

      // Check if the file exists
      try {
        const fileData = await fs.readFile(filePath, 'utf-8');
        existingData = JSON.parse(fileData) as NewsPost[];
        this.logger.log('Existing data loaded successfully.');
      } catch (error) {
        if (error.code === 'ENOENT') {
          this.logger.log('File does not exist. A new file will be created.');
        } else {
          this.logger.error('Error parsing existing JSON data:', error.message);
          throw new UnprocessableEntityException(
            'Error parsing existing JSON data',
            error.message,
          );
        }
      }

      // Append new data to existing data
      existingData.push(...newsData);

      // Write data back to the file
      await fs.writeFile(
        filePath,
        JSON.stringify(existingData, null, 4),
        'utf-8',
      );
      this.logger.log('Data has been successfully written to data.json');
    } catch (error) {
      this.logger.error('Error writing data to JSON file:', error.message);
    }
  }
}
