import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { UsersModule } from '../users/users.module';
import { TrackingSettingsModule } from '../tracking-settings/tracking-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location]),
    forwardRef(() => UsersModule),
    TrackingSettingsModule,
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
