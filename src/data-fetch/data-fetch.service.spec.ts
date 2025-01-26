import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { AxiosResponse, AxiosRequestHeaders } from 'axios';
import { DataFetchService } from './service/data-fetch.service';
import { News } from './entities/news.entity';
import { QueryBuilderService } from '../utils/query.builder.service';
import { QueryInput } from './dto/input/fetch.news.input';

describe('DataFetchService', () => {
  let service: DataFetchService;
  let httpService: HttpService;
  let newsRepository: Repository<News>;
  let configService: ConfigService;
  let queryBuilderService: QueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataFetchService,
        {
          provide: getRepositoryToken(News),
          useClass: Repository,
        },
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'WEBZ_IO_API_KEY') return 'dummy-api-key';
              if (key === 'WEBZ_NEWS_URL')
                return 'https://api.example.com/news';
              return null;
            }),
          },
        },
        {
          provide: QueryBuilderService,
          useValue: {
            build: jest.fn(() => 'title:(Android OR iPhone) language:english'),
          },
        },
      ],
    }).compile();

    service = module.get<DataFetchService>(DataFetchService);
    httpService = module.get<HttpService>(HttpService);
    newsRepository = module.get<Repository<News>>(getRepositoryToken(News));
    configService = module.get<ConfigService>(ConfigService);
    queryBuilderService = module.get<QueryBuilderService>(QueryBuilderService);
  });

  it('should fetch and save news correctly', async () => {
    // Mock API response
    const mockResponse: AxiosResponse = {
      data: {
        posts: [{ title: 'Sample Title', text: 'Sample Text' }],
        next: null,
        moreResultsAvailable: 0,
        totalResults: 1,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: { 'Content-Type': 'application/json' } as AxiosRequestHeaders,
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));
    jest.spyOn(newsRepository, 'save').mockResolvedValue({
      id: 'sample-id',
      title: 'Sample Title',
      text: 'Sample Text',
    } as News);

    // Mock query
    const mockQuery: QueryInput[] = [
      { field: 'title', values: ['Android', 'iPhone'], operation: 'or' },
    ];

    // Mock callback
    const callback = jest.fn();

    // Run the service method
    await service.fetchAndSaveNews(mockQuery, callback);

    // Verify that the query builder was called
    expect(queryBuilderService.build).toHaveBeenCalledWith(mockQuery);

    // Verify repository save method is called
    expect(newsRepository.save).toHaveBeenCalledWith({
      title: 'Sample Title',
      text: 'Sample Text',
    });

    // Verify callback is called
    expect(callback).toHaveBeenCalledWith(1, 0);
  });

  it('should throw an error if API key is missing', async () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'WEBZ_IO_API_KEY') return null; // Simulate missing API key
      if (key === 'WEBZ_NEWS_URL') return 'https://api.example.com/news';
      return null;
    });

    const mockQuery: QueryInput[] = [
      { field: 'title', values: ['Android', 'iPhone'], operation: 'or' },
    ];
    const callback = jest.fn();

    await expect(service.fetchAndSaveNews(mockQuery, callback)).rejects.toThrow(
      'Web hose API Key not found',
    );
  });

  it('should throw an error if API response format is unexpected', async () => {
    const mockResponse: AxiosResponse = {
      data: {}, // Simulate unexpected response format
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: { 'Content-Type': 'application/json' } as AxiosRequestHeaders,
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

    const mockQuery: QueryInput[] = [
      { field: 'title', values: ['Android', 'iPhone'], operation: 'or' },
    ];
    const callback = jest.fn();

    await expect(service.fetchAndSaveNews(mockQuery, callback)).rejects.toThrow(
      'Unexpected API response format',
    );
  });
});
