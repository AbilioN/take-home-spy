import { User } from '../../users/entities/user.entity';
export declare class Location {
    id: string;
    userId: string;
    user: User;
    latitude: number;
    longitude: number;
    createdAt: Date;
}
