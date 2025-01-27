import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Thread } from './thread.entity';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @OneToOne(() => Thread, { cascade: true, eager: true })
  @JoinColumn()
  thread: Thread;

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
