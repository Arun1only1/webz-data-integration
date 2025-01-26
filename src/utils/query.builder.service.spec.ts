import { QueryBuilderService } from './query.builder.service';
import { QueryInput } from 'src/data-fetch/dto/input/fetch.news.input';

describe('QueryBuilderService', () => {
  let service: QueryBuilderService;

  beforeEach(() => {
    service = new QueryBuilderService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('build', () => {
    it('should handle multiple values with an operation', () => {
      const queryInput: QueryInput[] = [
        {
          field: 'title',
          values: ['Android', 'iPhone'],
          operation: 'or',
        },
      ];

      const result = service.build(queryInput);

      expect(result).toBe(encodeURIComponent('title:(Android OR iPhone)'));
    });

    it('should handle a single value without an operation', () => {
      const queryInput: QueryInput[] = [
        {
          field: 'title',
          values: ['Android'],
        },
      ];

      const result = service.build(queryInput);

      expect(result).toBe(encodeURIComponent('title:Android'));
    });

    it('should handle multiple query inputs', () => {
      const queryInput: QueryInput[] = [
        {
          field: 'title',
          values: ['Android', 'iPhone'],
          operation: 'and',
        },
        {
          field: 'social.facebook.likes',
          values: [10],
          operation: '>',
        },
      ];

      const result = service.build(queryInput);

      expect(result).toBe(
        encodeURIComponent(
          'title:(Android AND iPhone) social.facebook.likes:>10',
        ),
      );
    });

    it('should return an empty string when no query input is provided', () => {
      const queryInput: QueryInput[] = [];

      const result = service.build(queryInput);

      expect(result).toBe('');
    });
  });
});
