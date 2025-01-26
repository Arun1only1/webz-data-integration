import { News } from 'src/data-fetch/entities/news.entity';

export class GetNewsResponse {
  message: string;
  posts: News[];
}
