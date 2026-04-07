import { Controller, Post, Body, Get, Put, Param, UseGuards, ParseUUIDPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
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
  async login(@Body() dto: LoginAdminDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.adminService.login(dto);
    res.setHeader('x-admin-token', result.token);
    return result;
  }

  @Put('settings')
  @UseGuards(AdminTokenGuard)
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.trackingSettingsService.upsert(dto);
  }

  @Get('users')
  @UseGuards(AdminTokenGuard)
  getUsers() {
    return this.adminService.getUsersWithStats();
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
