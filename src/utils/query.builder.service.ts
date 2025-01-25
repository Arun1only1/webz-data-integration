import { Injectable } from '@nestjs/common';

import { QueryInput } from 'src/data-fetch/dto/input/fetch.news.input';

@Injectable()
export class QueryBuilderService {
  private queryString: string[] = [];

  build(queryInput: QueryInput[]): string {
    queryInput.forEach((query) => {
      // If operation is present and values length is greater than 1
      if (query?.operation && query.values.length > 1) {
        this.queryString.push(
          `${query.field}:(${query.values.join(` ${query.operation.toUpperCase()} `)})`,
        );
      } else if (query?.operation && query.values.length === 1) {
        // If operation is present and values length is 1
        this.queryString.push(
          `${query.field}:${query.operation}${query.values[0]}`,
        );
      } else {
        // If operation is not present
        this.queryString.push(`${query.field}:${query.values[0]}`);
      }
    });

    // Encode the query string
    const encodedUrl = encodeURIComponent(this.queryString.join(' '));

    return encodedUrl;
  }
}
