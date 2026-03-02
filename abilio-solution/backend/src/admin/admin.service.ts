import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { LoginAdminDto } from './dto/login-admin.dto';
import { AdminAuthService } from './admin-auth.service';
import { UsersService } from '../users/users.service';
import { LocationsService } from '../locations/locations.service';

const SALT_ROUNDS = 10;

export type UserWithStats = {
  id: string;
  email: string;
  lastLocation: { latitude: number; longitude: number; createdAt: Date } | null;
  totalLocations: number;
};

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly adminAuthService: AdminAuthService,
    private readonly usersService: UsersService,
    private readonly locationsService: LocationsService,
  ) {}

  async validatePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  async login(dto: LoginAdminDto): Promise<{ success: true; token: string }> {
    const admin = await this.adminRepository.findOne({
      where: { email: dto.email },
    });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await this.validatePassword(dto.password, admin.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.adminAuthService.generateToken();
    return { success: true, token };
  }

  async getUsersWithStats(): Promise<UserWithStats[]> {
    const users = await this.usersService.findAll();
    return Promise.all(
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
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return this.adminRepository.findOne({ where: { email } });
  }
}
