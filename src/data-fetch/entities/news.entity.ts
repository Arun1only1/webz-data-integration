import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  uuid: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  ord_in_thread: number;

  @Column({ nullable: true })
  author: string;

  @Column({ nullable: true })
  parent_url: string;

  @Column({ nullable: true })
  published: Date;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  text: string;

  @Column({ nullable: true })
  highlightText: string;

  @Column({ nullable: true })
  highlightTitle: string;

  @Column({ nullable: true })
  highlightThreadTitle: string;

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true })
  sentiment: string;

  @Column('simple-array', { nullable: true })
  categories: string[];

  @Column('simple-array', { nullable: true })
  topics: string[];

  @Column({ nullable: true })
  ai_allow: boolean;

  @Column({ nullable: true })
  has_canonical: boolean;

  @Column('simple-array', { nullable: true })
  external_links: string[];

  @Column('simple-array', { nullable: true })
  external_images: string[];

  @Column('json', { nullable: true })
  thread: {
    uuid: string;
    url: string;
    site_full: string;
    site: string;
    site_section: string;
    site_categories: string[];
    section_title: string;
    title: string;
    title_full: string;
    published: Date;
    replies_count: number;
    participants_count: number;
    site_type: string;
    country: string;
    main_image: string;
    performance_score: number;
    domain_rank: number;
    domain_rank_updated: Date;
    social: {
      updated: Date;
      facebook: { likes: number; comments: number; shares: number };
      vk: { shares: number };
    };
  };

  @Column({ default: false })
  webz_reporter: boolean;

  @Column({ nullable: true })
  rating: number;

  @Column({ nullable: true })
  crawled: Date;

  @Column({ nullable: true })
  updated: Date;

  @Column('json', { nullable: true })
  syndication: {
    syndicated: boolean | null;
    syndicate_id: string | null;
    first_syndicated: boolean;
  };

  @Column('json', { nullable: true })
  entities: {
    persons: { name: string; sentiment: string }[];
    organizations: { name: string; sentiment: string }[];
    locations: { name: string; sentiment: string }[];
  };
}
