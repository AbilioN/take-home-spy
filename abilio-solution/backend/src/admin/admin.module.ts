import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminTokenGuard } from './guards/admin-token.guard';
import { TrackingSettingsModule } from '../tracking-settings/tracking-settings.module';
import { UsersModule } from '../users/users.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    TrackingSettingsModule,
    UsersModule,
    LocationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminAuthService, AdminTokenGuard],
  exports: [AdminService],
})
export class AdminModule {}
