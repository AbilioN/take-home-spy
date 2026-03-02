import { Controller, Post, Body } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  async create(@Body() dto: CreateLocationDto) {
    const result = await this.locationsService.create(dto);
    if (result.saved) return { saved: true };
    return { saved: false, reason: result.reason };
  }
}
