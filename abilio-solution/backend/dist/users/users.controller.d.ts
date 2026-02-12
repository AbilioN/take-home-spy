import { UsersService } from './users.service';
import { LocationsService } from '../locations/locations.service';
export declare class UsersController {
    private readonly usersService;
    private readonly locationsService;
    constructor(usersService: UsersService, locationsService: LocationsService);
    getLastLocation(id: string): Promise<import("../locations/entities/location.entity").Location | null>;
    getHistory(id: string): Promise<import("../locations/entities/location.entity").Location[]>;
}
