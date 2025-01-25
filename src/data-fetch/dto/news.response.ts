interface Social {
  facebook: {
    likes: number;
    comments: number;
    shares: number;
  };
  vk: {
    shares: number;
  };
}

interface Thread {
  uuid: string;
  url: string;
  site_full: string;
  site: string;
  site_section: string;
  site_categories: string[];
  section_title: string;
  title: string;
  title_full: string;
  published: string;
  replies_count: number;
  participants_count: number;
  site_type: string;
  country: string;
  main_image: string;
  performance_score: number;
  domain_rank: number;
  domain_rank_updated: string;
  social: Social;
}

interface Entities {
  persons: string[];
  organizations: string[];
  locations: string[];
}

interface Syndication {
  syndicated: any;
  syndicate_id: any;
  first_syndicated: boolean;
}

export class NewsPost {
  thread: Thread;
  uuid: string;
  url: string;
  ord_in_thread: number;
  parent_url: string | null;
  author: string;
  published: string;
  title: string;
  text: string;
  highlightText: string;
  highlightTitle: string;
  highlightThreadTitle: string;
  language: string;
  sentiment: any;
  categories: any;
  topics: any;
  ai_allow: boolean;
  has_canonical: boolean;
  webz_reporter: boolean;
  external_links: string[];
  external_images: string[];
  entities: Entities;
  syndication: Syndication;
  rating: any;
  crawled: string;
  updated: string;
}

export class NewsResponse {
  posts: NewsPost[];
  next?: string | null;
  moreResultsAvailable: number;
  totalResults: number;
}
