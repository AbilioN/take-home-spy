import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UsersService } from '../users/users.service';
export declare class LocationsService {
    private readonly locationRepository;
    private readonly usersService;
    constructor(locationRepository: Repository<Location>, usersService: UsersService);
    create(dto: CreateLocationDto): Promise<Location>;
    findLastByUserId(userId: string): Promise<Location | null>;
    findHistoryByUserId(userId: string): Promise<Location[]>;
}
