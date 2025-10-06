import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, In, Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { WishesService } from '../wishes/wishes.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    private wishesService: WishesService,
  ) {}

  async create(
    createWishlistDto: CreateWishlistDto,
    user: User,
  ): Promise<Wishlist> {
    const items = await this.wishesService.findAll({
      id: In(createWishlistDto.itemsId),
    });

    const wishlist = this.wishlistsRepository.create({
      ...createWishlistDto,
      items,
      owner: user,
    });

    const savedWishlist = await this.wishlistsRepository.save(wishlist);

    return this.findOne({
      relations: ['owner', 'items'],
      where: { id: savedWishlist.id },
    });
  }

  async findAll(): Promise<Wishlist[]> {
    return await this.wishlistsRepository.find({
      order: { id: 'ASC' },
      relations: ['owner', 'items'],
    });
  }

  async findById(id: number): Promise<Wishlist> {
    return await this.findOne({ relations: ['owner', 'items'], where: { id } });
  }

  async findOne(options: FindOneOptions<Wishlist>): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne(options);

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    return wishlist;
  }

  async removeOne(id: number, user: User): Promise<Wishlist> {
    const wishlist = await this.findOne({
      relations: ['owner', 'items'],
      where: { id },
    });

    if (wishlist.owner.id !== user.id) {
      throw new ForbiddenException("You cannot delete someone else's wishlist");
    }

    await this.wishlistsRepository.remove(wishlist);

    return wishlist;
  }

  async updateOne(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    user: User,
  ): Promise<Wishlist> {
    const wishlist = await this.findOne({ where: { id } });

    if (wishlist.owner.id !== user.id) {
      throw new ForbiddenException("You cannot update someone else's wishlist");
    }

    await this.wishlistsRepository.update(id, updateWishlistDto);

    return wishlist;
  }
}
