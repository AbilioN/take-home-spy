"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const location_entity_1 = require("./entities/location.entity");
const users_service_1 = require("../users/users.service");
let LocationsService = class LocationsService {
    locationRepository;
    usersService;
    constructor(locationRepository, usersService) {
        this.locationRepository = locationRepository;
        this.usersService = usersService;
    }
    async create(dto) {
        await this.usersService.findById(dto.userId);
        const location = this.locationRepository.create({
            userId: dto.userId,
            latitude: dto.latitude,
            longitude: dto.longitude,
        });
        return this.locationRepository.save(location);
    }
    async findLastByUserId(userId) {
        const location = await this.locationRepository.findOne({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        return location ?? null;
    }
    async findHistoryByUserId(userId) {
        return this.locationRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService])
], LocationsService);
//# sourceMappingURL=locations.service.js.map