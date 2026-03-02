import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async register(dto: RegisterUserDto): Promise<{ id: string; email: string; createdAt: Date }> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = this.userRepository.create({
      email: dto.email,
      password: hashed,
    });
    const saved = await this.userRepository.save(user);
    return {
      id: saved.id,
      email: saved.email,
      createdAt: saved.createdAt,
    };
  }

  async login(dto: LoginUserDto): Promise<{ success: true; userId: string }> {
    const user = await this.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return { success: true, userId: user.id };
  }
}
