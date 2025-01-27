import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { News } from './news.entity';

@Entity()
export class Thread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  site_full: string;

  @Column({ nullable: true })
  site: string;

  @Column({ nullable: true })
  site_section: string;

  @Column('simple-array', { default: [] })
  site_categories: string[];

  @Column({ nullable: true })
  section_title: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  title_full: string;

  @Column({ nullable: true })
  published: Date;

  @Column({ nullable: true })
  replies_count: number;

  @Column({ nullable: true })
  participants_count: number;

  @Column({ nullable: true })
  site_type: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  main_image: string;

  @Column({ default: 0 })
  performance_score: number;

  @Column({ nullable: true })
  domain_rank: number;

  @Column({ nullable: true })
  domain_rank_updated: Date;

  @Column('json', { nullable: true })
  social: {
    updated: Date;
    facebook: { likes: number; comments: number; shares: number };
    vk: { shares: number };
  };

  // One-to-one relationship to Post
  @OneToOne(() => News, (news) => news.thread)
  news: News;
}
