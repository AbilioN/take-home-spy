import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { LoginAdminDto } from './dto/login-admin.dto';
import { AdminAuthService } from './admin-auth.service';

const SALT_ROUNDS = 10;

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly adminAuthService: AdminAuthService,
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

  async findByEmail(email: string): Promise<Admin | null> {
    return this.adminRepository.findOne({ where: { email } });
  }
}
