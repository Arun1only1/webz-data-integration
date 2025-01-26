import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

/**
 * PaginationInput class is used to handle pagination parameters.
 */
export class PaginationInput {
  /**
   * The page number to fetch. Defaults to 1.
   */
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  /**
   * The number of items per page. Defaults to 10.
   */
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number = 10;
}
