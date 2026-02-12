import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Inject, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { LocationsService } from '../locations/locations.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => LocationsService))
    private readonly locationsService: LocationsService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.usersService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginUserDto) {
    return this.usersService.login(dto);
  }

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
