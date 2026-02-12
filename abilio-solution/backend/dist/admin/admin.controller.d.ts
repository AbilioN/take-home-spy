import { AdminService } from './admin.service';
import { LoginAdminDto } from './dto/login-admin.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    login(dto: LoginAdminDto): Promise<{
        success: true;
    }>;
}
