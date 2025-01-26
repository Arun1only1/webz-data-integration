import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

import MSG from '../../../constants/validation.message';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '../../../constants/general.constants';

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
  @Min(1, { message: MSG.PROPERTY_MIN_VALUE as string })
  page: number = DEFAULT_PAGE;

  /**
   * The number of items per page. Defaults to 10.
   */
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1, { message: MSG.PROPERTY_MIN_VALUE as string })
  limit: number = DEFAULT_LIMIT;
}
