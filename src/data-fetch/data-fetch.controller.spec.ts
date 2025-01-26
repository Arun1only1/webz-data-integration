import { Test, TestingModule } from '@nestjs/testing';
import { DataFetchController } from './data-fetch.controller';
import { DataFetchService } from './service/data-fetch.service';
import { News } from './entities/news.entity';
import { FetchNewsInput } from './dto/input/fetch.news.input';

describe('DataFetchController', () => {
  let controller: DataFetchController;
  let service: DataFetchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataFetchController],
      providers: [
        {
          provide: DataFetchService,
          useValue: {
            fetchAndSaveNews: jest.fn(),
            findAllNews: jest.fn(),
          },
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
        message: 'News fetched and saved successfully.',
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
    it('should call findAllNews and return an array of news', async () => {
      const mockNews: News[] = [
        { id: '1', title: 'Test News', text: 'Sample text' } as News,
      ];
      jest.spyOn(service, 'findAllNews').mockResolvedValue(mockNews);

      const result = await controller.getAllNews();

      expect(service.findAllNews).toHaveBeenCalled();
      expect(result).toEqual(mockNews);
    });

    it('should handle errors thrown by findAllNews', async () => {
      jest
        .spyOn(service, 'findAllNews')
        .mockRejectedValue(new Error('Database fetch failed'));

      await expect(controller.getAllNews()).rejects.toThrow(
        'Database fetch failed',
      );

      expect(service.findAllNews).toHaveBeenCalled();
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
        message: 'News fetched and saved successfully.',
      });
    });
  });
});
