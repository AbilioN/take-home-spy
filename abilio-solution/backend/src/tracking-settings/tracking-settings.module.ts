import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingSettings } from './entities/tracking-settings.entity';
import { TrackingSettingsService } from './tracking-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrackingSettings])],
  providers: [TrackingSettingsService],
  exports: [TrackingSettingsService],
})
export class TrackingSettingsModule {}
