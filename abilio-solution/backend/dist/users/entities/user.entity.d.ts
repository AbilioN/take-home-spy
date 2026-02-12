import { Location } from '../../locations/entities/location.entity';
export declare class User {
    id: string;
    email: string;
    createdAt: Date;
    locations: Location[];
}
