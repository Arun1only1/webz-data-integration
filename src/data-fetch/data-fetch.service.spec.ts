import { Test, TestingModule } from '@nestjs/testing';
import { DataFetchService } from './data-fetch.service';

describe('DataFetchService', () => {
  let service: DataFetchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataFetchService],
    }).compile();

    service = module.get<DataFetchService>(DataFetchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
