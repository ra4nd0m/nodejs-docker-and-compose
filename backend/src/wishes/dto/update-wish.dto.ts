import { PartialType } from '@nestjs/mapped-types';

import { CreateWishDto } from './create-wish.dto';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  raised: number;
}
