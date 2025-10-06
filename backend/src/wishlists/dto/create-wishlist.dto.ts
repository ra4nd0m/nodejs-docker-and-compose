import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateWishlistDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  image: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  itemsId: number[];

  @IsNotEmpty()
  @IsString()
  name: string;
}
