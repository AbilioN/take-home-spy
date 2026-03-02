import { Controller, Post, Body, Get, Put, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { UpdateSettingsDto } from '../tracking-settings/dto/update-settings.dto';
import { AdminTokenGuard } from './guards/admin-token.guard';
import { TrackingSettingsService } from '../tracking-settings/tracking-settings.service';
import { UsersService } from '../users/users.service';
import { LocationsService } from '../locations/locations.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly trackingSettingsService: TrackingSettingsService,
    private readonly usersService: UsersService,
    private readonly locationsService: LocationsService,
  ) {}

  @Post('login')
  login(@Body() dto: LoginAdminDto) {
    return this.adminService.login(dto);
  }

  @Put('settings')
  @UseGuards(AdminTokenGuard)
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.trackingSettingsService.upsert(dto);
  }

  @Get('users')
  @UseGuards(AdminTokenGuard)
  async getUsers() {
    const users = await this.usersService.findAll();
    const list = await Promise.all(
      users.map(async (u) => {
        const lastLocation = await this.locationsService.findLastByUserId(u.id);
        const totalLocations = await this.locationsService.countByUserId(u.id);
        return {
          id: u.id,
          email: u.email,
          lastLocation: lastLocation
            ? { latitude: lastLocation.latitude, longitude: lastLocation.longitude, createdAt: lastLocation.createdAt }
            : null,
          totalLocations,
        };
      }),
    );
    return list;
  }

  @Get('users/:id/trajectory')
  @UseGuards(AdminTokenGuard)
  async getTrajectory(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.findById(id);
    return this.locationsService.findTrajectoryByUserId(id);
  }

  @Get('users/:id/trajectory/geojson')
  @UseGuards(AdminTokenGuard)
  async getTrajectoryGeojson(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.findById(id);
    const trajectory = await this.locationsService.findTrajectoryByUserId(id);
    const coordinates = trajectory.map((p) => [p.longitude, p.latitude] as [number, number]);
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates,
      },
    };
  }
}
