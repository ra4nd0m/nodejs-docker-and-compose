import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';

import { UsersService } from '../users/users.service';
import { WishesService } from '../wishes/wishes.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private wishesService: WishesService,
    private usersService: UsersService,
  ) {}

  async create(createOfferDto: CreateOfferDto, userId: number): Promise<Offer> {
    const { amount, itemId } = createOfferDto;

    const user = await this.usersService.findOne({
      relations: ['wishes', 'offers', 'wishlists'],
      where: { id: userId },
    });

    const wish = await this.wishesService.findOne({
      relations: ['owner', 'offers'],
      where: { id: itemId },
    });

    const raisedPlusDonation = wish.raised + amount;

    if (user.id === wish.owner.id) {
      throw new BadRequestException('You cannot donate to your own gift');
    }

    if (wish.raised === wish.price) {
      throw new BadRequestException('The gift has already been fully funded');
    }

    if (raisedPlusDonation > wish.price) {
      throw new BadRequestException('The donation exceeds the gift price');
    }

    await this.wishesService.updateOne(itemId, {
      raised: raisedPlusDonation,
    });

    return await this.offersRepository.save({
      ...createOfferDto,
      item: wish,
      user,
    });
  }

  async findAll(): Promise<Offer[]> {
    return await this.offersRepository.find({
      relations: ['user', 'item'],
    });
  }

  async findOfferById(id: number): Promise<Offer> {
    return await this.findOne({ relations: ['user', 'item'], where: { id } });
  }

  async findOne(options: FindOneOptions<Offer>): Promise<Offer> {
    const offer = await this.offersRepository.findOne(options);

    if (!offer) {
      throw new NotFoundException();
    }

    return offer;
  }
}
