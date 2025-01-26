import { Test, TestingModule } from '@nestjs/testing';
import Lang from '../constants/language';
import { DataFetchController } from './data-fetch.controller';
import { FetchNewsInput } from './dto/input/fetch.news.input';
import { PaginationInput } from './dto/input/pagination.input';
import { DataFetchService } from './service/data-fetch.service';

describe('DataFetchController', () => {
  let controller: DataFetchController;
  let service: DataFetchService;

  const mockDataFetchService = {
    fetchAndSaveNews: jest.fn(),
    findAllNews: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataFetchController],
      providers: [
        {
          provide: DataFetchService,
          useValue: mockDataFetchService,
        },
      ],
    }).compile();

    controller = module.get<DataFetchController>(DataFetchController);
    service = module.get<DataFetchService>(DataFetchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('fetchAndSaveNewsData', () => {
    it('should call fetchAndSaveNews and return a success message', async () => {
      const mockInput: FetchNewsInput = {
        query: [
          { field: 'title', values: ['android', 'iPhone'], operation: 'or' },
        ],
      };

      jest.spyOn(service, 'fetchAndSaveNews').mockResolvedValue(undefined);

      const result = await controller.fetchAndSaveNewsData(mockInput);

      expect(service.fetchAndSaveNews).toHaveBeenCalledWith(
        mockInput.query,
        expect.any(Function),
      );
      expect(result).toEqual({
        message: Lang.NEWS_FETCHED_SUCCESSFULLY,
      });
    });

    it('should handle errors thrown by fetchAndSaveNews', async () => {
      const mockInput: FetchNewsInput = {
        query: [
          { field: 'title', values: ['android', 'iPhone'], operation: 'or' },
        ],
      };

      jest
        .spyOn(service, 'fetchAndSaveNews')
        .mockRejectedValue(new Error('Fetch failed'));

      await expect(controller.fetchAndSaveNewsData(mockInput)).rejects.toThrow(
        'Fetch failed',
      );

      expect(service.fetchAndSaveNews).toHaveBeenCalledWith(
        mockInput.query,
        expect.any(Function),
      );
    });
  });

  describe('getAllNews', () => {
    it('should call findAllNews and return the result', async () => {
      const paginationInput: PaginationInput = { page: 1, limit: 10 };
      const mockPosts = [{ id: 1, title: 'Test News', text: 'Content' }];

      mockDataFetchService.findAllNews.mockResolvedValueOnce(mockPosts);

      const result = await controller.getAllNews(paginationInput);

      expect(service.findAllNews).toHaveBeenCalledWith(paginationInput);
      expect(result).toEqual({ message: Lang.SUCCESS, posts: mockPosts });
    });
  });

  describe('fetchAndSaveNewsData with callback', () => {
    it('should invoke the callback and log fetched and remaining posts', async () => {
      const mockInput: FetchNewsInput = {
        query: [
          { field: 'title', values: ['android', 'iPhone'], operation: 'or' },
        ],
      };

      const mockLoggerLog = jest
        .spyOn(controller['logger'], 'log')
        .mockImplementation();

      jest
        .spyOn(service, 'fetchAndSaveNews')
        .mockImplementation(async (_, callback) => {
          callback(10, 90); // Simulate the callback with mock data
        });

      const result = await controller.fetchAndSaveNewsData(mockInput);

      expect(service.fetchAndSaveNews).toHaveBeenCalledWith(
        mockInput.query,
        expect.any(Function),
      );

      // Verify callback logging
      expect(mockLoggerLog).toHaveBeenCalledWith('Fetched 10 posts.');
      expect(mockLoggerLog).toHaveBeenCalledWith('Remaining 90 posts.');
      expect(result).toEqual({
        message: Lang.NEWS_FETCHED_SUCCESSFULLY,
      });
    });
  });
});
