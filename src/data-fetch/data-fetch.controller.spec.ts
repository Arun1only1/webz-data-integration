import { Test, TestingModule } from '@nestjs/testing';
import { DataFetchController } from './data-fetch.controller';
import { DataFetchService } from './service/data-fetch.service';

describe('DataFetchController', () => {
  let controller: DataFetchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataFetchController],
      providers: [DataFetchService],
    }).compile();

    controller = module.get<DataFetchController>(DataFetchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
