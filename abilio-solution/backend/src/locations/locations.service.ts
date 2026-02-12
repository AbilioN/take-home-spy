import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateLocationDto): Promise<Location> {
    await this.usersService.findById(dto.userId);
    const location = this.locationRepository.create({
      userId: dto.userId,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
    return this.locationRepository.save(location);
  }

  async findLastByUserId(userId: string): Promise<Location | null> {
    const location = await this.locationRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return location ?? null;
  }

  async findHistoryByUserId(userId: string): Promise<Location[]> {
    return this.locationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
