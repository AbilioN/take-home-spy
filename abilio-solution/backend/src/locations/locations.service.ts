import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UsersService } from '../users/users.service';
import { TrackingSettingsService } from '../tracking-settings/tracking-settings.service';
import { haversineDistanceMeters } from '../utils/haversine';

export type CreateLocationResult =
  | { saved: true }
  | { saved: false; reason: string };

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly trackingSettingsService: TrackingSettingsService,
  ) {}

  async create(dto: CreateLocationDto): Promise<CreateLocationResult> {
    await this.usersService.findById(dto.userId);
    const settings = await this.trackingSettingsService.getActive();
    const last = await this.findLastByUserId(dto.userId);

    if (!last) {
      const location = this.locationRepository.create({
        userId: dto.userId,
        latitude: dto.latitude,
        longitude: dto.longitude,
      });
      await this.locationRepository.save(location);
      return { saved: true };
    }

    const distanceMeters = haversineDistanceMeters(
      last.latitude,
      last.longitude,
      dto.latitude,
      dto.longitude,
    );

    if (distanceMeters < settings.minimumDistanceMeters) {
      return { saved: false, reason: 'Minimum distance not reached' };
    }

    const location = this.locationRepository.create({
      userId: dto.userId,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
    await this.locationRepository.save(location);
    return { saved: true };
  }

  async findLastByUserId(userId: string): Promise<Location | null> {
    const rows = await this.locationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 1,
    });
    return rows[0] ?? null;
  }

  async findHistoryByUserId(userId: string): Promise<Location[]> {
    return this.locationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findTrajectoryByUserId(userId: string): Promise<{ latitude: number; longitude: number; createdAt: Date }[]> {
    return this.locationRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
      select: ['latitude', 'longitude', 'createdAt'],
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.locationRepository.count({ where: { userId } });
  }
}
