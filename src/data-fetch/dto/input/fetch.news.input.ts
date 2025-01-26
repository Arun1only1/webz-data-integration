import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

/**
 * Represents the input for a query operation.
 */
export class QueryInput {
  /**
   * The field to be queried.
   * @type {string}
   */
  @IsString()
  @IsNotEmpty()
  field: string;

  /**
   * The operation to be performed on the field.
   * Optional field.
   * @type {'and' | 'or' | 'not' | '>' | '<' | '>=' | '<='}
   */
  @IsString()
  @IsOptional()
  @IsEnum(['and', 'or', 'not', '>', '<', '>=', '<='])
  operation?: 'and' | 'or' | 'not' | '>' | '<' | '>=' | '<=';

  /**
   * The values to be used in the query.
   * Must be a non-empty array of strings or numbers.
   * @type {(string | number)[]}
   */
  @IsArray()
  @ArrayNotEmpty()
  values: (string | number)[];
}

export class FetchNewsInput {
  @Type(() => QueryInput)
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  query: QueryInput[];
}
