import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { QueryBuilderService } from '../utils/query.builder.service';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of, throwError } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { News } from './entities/news.entity';
import { DataFetchService } from './service/data-fetch.service';
import { QueryInput } from './dto/input/fetch.news.input';
import { NewsPost } from './dto/response/news.response';
import Lang from 'src/constants/language';

const mockNewsRepository = {
  findAndCount: jest.fn(),
  save: jest.fn(),
};

const mockHttpService = {
  get: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockQueryBuilderService = {
  build: jest.fn(),
};

const mockDataSource = {
  createQueryRunner: jest.fn(),
};

describe('DataFetchService', () => {
  let service: DataFetchService;
  let newsRepository: Repository<News>;
  let httpService: HttpService;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    // Mock the queryRunner
    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        createQueryBuilder: jest.fn(() => ({
          insert: jest.fn().mockReturnThis(),
          into: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          execute: jest.fn(),
        })),
      },
    };

    // Override queryRunner with the mocked version
    queryRunner = mockQueryRunner as unknown as QueryRunner;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataFetchService,
        { provide: getRepositoryToken(News), useValue: mockNewsRepository },
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: QueryBuilderService, useValue: mockQueryBuilderService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<DataFetchService>(DataFetchService);
    newsRepository = module.get<Repository<News>>(getRepositoryToken(News));
    httpService = module.get<HttpService>(HttpService);

    mockDataSource.createQueryRunner.mockReturnValue(queryRunner);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllNews', () => {
    it('should return paginated news', async () => {
      const mockNews = [{ id: '1', title: 'Test News' } as unknown as News];
      const mockTotal = 1;
      mockNewsRepository.findAndCount.mockResolvedValue([mockNews, mockTotal]);

      const result = await service.findAllNews({ page: 1, limit: 10 });

      expect(result).toEqual({
        message: Lang.SUCCESS,
        posts: mockNews,
        totalPage: 1,
      });
      expect(newsRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('should return empty array if no news found', async () => {
      mockNewsRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAllNews({ page: 1, limit: 10 });

      expect(result).toEqual({
        message: Lang.SUCCESS,
        posts: [],
        totalPage: 0,
      });
      expect(newsRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });
  });

  describe('fetchDocumentsFromApi', () => {
    it('should fetch data from the API', async () => {
      const mockApiResponse = { data: { posts: [], totalResults: 0 } };
      mockHttpService.get.mockReturnValue(of(mockApiResponse));

      const result = await service.fetchDocumentsFromApi(
        'http://api.example.com',
      );

      expect(result).toEqual(mockApiResponse.data);
      expect(httpService.get).toHaveBeenCalledWith('http://api.example.com');
    });

    it('should throw an error if API call fails', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('API Error')),
      );

      await expect(
        service.fetchDocumentsFromApi('http://api.example.com'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('processDocuments', () => {
    it('should fetch and save documents', async () => {
      const mockQuery: QueryInput[] = [
        {
          field: 'title',
          values: ['Android', 'iPhone'],
          operation: 'or',
        },
      ];
      const mockPosts = [
        { id: '1', title: 'Test News' } as unknown as NewsPost,
      ];
      const mockResponse = { posts: mockPosts, totalResults: 1 };

      // Mocking the API response
      mockHttpService.get.mockReturnValue(of({ data: mockResponse }));
      jest.spyOn(service, 'savePostToDatabase').mockResolvedValueOnce();
      mockConfigService.get.mockReturnValue('mock-token');

      // function should return 1 and 0
      const callback = jest.fn();

      // Ensure the callback is called with the correct parameters
      await service.processDocuments(mockQuery, callback);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    describe('savePostToDatabase', () => {
      it('should save posts to the database', async () => {
        const mockPosts = [
          { id: '1', title: 'Test News' } as unknown as NewsPost,
        ];
        queryRunner = {
          manager: {
            createQueryBuilder: jest.fn(() => ({
              insert: jest.fn().mockReturnThis(),
              into: jest.fn().mockReturnThis(),
              values: jest.fn().mockReturnThis(),
              execute: jest.fn(),
            })),
          },
        } as unknown as QueryRunner;

        await service.savePostToDatabase(mockPosts, queryRunner);
        expect(queryRunner.manager.createQueryBuilder).toHaveBeenCalled();
      });
    });
  });
});
