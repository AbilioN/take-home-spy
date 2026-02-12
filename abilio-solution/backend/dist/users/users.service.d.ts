import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    register(dto: RegisterUserDto): Promise<{
        id: string;
        email: string;
        createdAt: Date;
    }>;
    login(dto: LoginUserDto): Promise<{
        success: true;
        userId: string;
    }>;
}
