import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { LoginAdminDto } from './dto/login-admin.dto';
export declare class AdminService {
    private readonly adminRepository;
    constructor(adminRepository: Repository<Admin>);
    hashPassword(plain: string): Promise<string>;
    validatePassword(plain: string, hashed: string): Promise<boolean>;
    login(dto: LoginAdminDto): Promise<{
        success: true;
    }>;
    findByEmail(email: string): Promise<Admin | null>;
}
