import { Controller, Get, Param, ParseUUIDPipe, Inject, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { LocationsService } from '../locations/locations.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => LocationsService))
    private readonly locationsService: LocationsService,
  ) {}

  @Get(':id/last-location')
  async getLastLocation(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.findById(id);
    return this.locationsService.findLastByUserId(id);
  }

  @Get(':id/history')
  async getHistory(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.findById(id);
    return this.locationsService.findHistoryByUserId(id);
  }
}
