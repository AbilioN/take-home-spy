import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingSettings } from './entities/tracking-settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const DEFAULT_MINIMUM_DISTANCE_METERS = 50;

@Injectable()
export class TrackingSettingsService {
  constructor(
    @InjectRepository(TrackingSettings)
    private readonly repository: Repository<TrackingSettings>,
  ) {}

  async getActive(): Promise<TrackingSettings> {
    const rows = await this.repository.find({ order: { createdAt: 'DESC' }, take: 1 });
    let settings = rows[0] ?? null;
    if (!settings) {
      settings = this.repository.create({
        minimumDistanceMeters: DEFAULT_MINIMUM_DISTANCE_METERS,
      });
      await this.repository.save(settings);
    }
    return settings;
  }

  async upsert(dto: UpdateSettingsDto): Promise<TrackingSettings> {
    const rows = await this.repository.find({ order: { createdAt: 'DESC' }, take: 1 });
    const existing = rows[0] ?? null;
    if (existing) {
      existing.minimumDistanceMeters = dto.minimumDistanceMeters;
      return this.repository.save(existing);
    }
    const settings = this.repository.create({
      minimumDistanceMeters: dto.minimumDistanceMeters,
    });
    return this.repository.save(settings);
  }
}
