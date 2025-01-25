import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class QueryInput {
  @IsString()
  @IsNotEmpty()
  field: string;

  @IsString()
  @IsOptional()
  operation?: 'and' | 'or' | 'not' | '>' | '<' | '>=' | '<=' | '=';

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
