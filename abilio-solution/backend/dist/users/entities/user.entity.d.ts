import { Location } from '../../locations/entities/location.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    createdAt: Date;
    locations: Location[];
}
