import { UsersService } from './users.service';
import { LocationsService } from '../locations/locations.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
export declare class UsersController {
    private readonly usersService;
    private readonly locationsService;
    constructor(usersService: UsersService, locationsService: LocationsService);
    register(dto: RegisterUserDto): Promise<{
        id: string;
        email: string;
        createdAt: Date;
    }>;
    login(dto: LoginUserDto): Promise<{
        success: true;
        userId: string;
    }>;
    getLastLocation(id: string): Promise<import("../locations/entities/location.entity").Location | null>;
    getHistory(id: string): Promise<import("../locations/entities/location.entity").Location[]>;
}
