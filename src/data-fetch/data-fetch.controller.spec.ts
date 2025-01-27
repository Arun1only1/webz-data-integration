import { Test, TestingModule } from '@nestjs/testing';
import Lang from '../constants/language';
import { DataFetchController } from './data-fetch.controller';
import { FetchNewsInput, QueryInput } from './dto/input/fetch.news.input';
import { PaginationInput } from './dto/input/pagination.input';
import { GetNewsResponse } from './dto/response/get.news.response';
import { MessageResponse } from './dto/response/message.response';
import { News } from './entities/news.entity';
import { DataFetchService } from './service/data-fetch.service';

// Mocked dependencies
const mockDataFetchService = {
  processDocuments: jest.fn(),
  findAllNews: jest.fn(),
};

describe('DataFetchController', () => {
  let controller: DataFetchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataFetchController],
      providers: [
        { provide: DataFetchService, useValue: mockDataFetchService },
      ],
    }).compile();

    controller = module.get<DataFetchController>(DataFetchController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for POST /news/fetch
  describe('fetchAndSaveNewsData', () => {
    it('should call processDocuments and return success message', async () => {
      const mockQuery: QueryInput[] = [
        {
          field: 'title',
          values: ['Android', 'iPhone'],
          operation: 'or',
        },
      ];

      const mockFetchNewsInput: FetchNewsInput = { query: mockQuery };
      mockDataFetchService.processDocuments.mockImplementation(
        (query, callback) => {
          callback(5, 0);
        },
      );

      const result: MessageResponse =
        await controller.fetchAndSaveNewsData(mockFetchNewsInput);

      expect(result).toEqual({ message: Lang.NEWS_FETCHED_SUCCESSFULLY });
      expect(mockDataFetchService.processDocuments).toHaveBeenCalledWith(
        mockQuery,
        expect.any(Function),
      );
    });

    it('should log the fetched and remaining posts', async () => {
      const mockQuery: QueryInput[] = [
        {
          field: 'title',
          values: ['Android', 'iPhone'],
          operation: 'or',
        },
      ];

      const mockFetchNewsInput: FetchNewsInput = { query: mockQuery };

      mockDataFetchService.processDocuments.mockImplementation(
        (query, callback) => {
          callback(5, 0);
        },
      );

      // Capture the logs
      const logSpy = jest
        .spyOn(controller['logger'], 'log')
        .mockImplementation();

      await controller.fetchAndSaveNewsData(mockFetchNewsInput);

      // Ensure that the logs are called with the correct values
      expect(logSpy).toHaveBeenCalledWith('Fetched 5 posts.');
      expect(logSpy).toHaveBeenCalledWith('Remaining 0 posts.');
      expect(logSpy).toHaveBeenCalledTimes(2);
    });
  });

  // Test for GET /news/all
  describe('getAllNews', () => {
    it('should return paginated news', async () => {
      const paginationInput: PaginationInput = { page: 1, limit: 10 };
      const mockGetNewsResponse: GetNewsResponse = {
        message: Lang.SUCCESS,
        posts: [{ id: '1', title: 'Test News' } as unknown as News],
        totalPage: 1,
      };

      mockDataFetchService.findAllNews.mockResolvedValueOnce(
        mockGetNewsResponse,
      );

      const result = await controller.getAllNews(paginationInput);

      expect(result).toEqual(mockGetNewsResponse);
      expect(mockDataFetchService.findAllNews).toHaveBeenCalledWith(
        paginationInput,
      );
    });
  });
});
