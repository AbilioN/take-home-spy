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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const locations_service_1 = require("../locations/locations.service");
let UsersController = class UsersController {
    usersService;
    locationsService;
    constructor(usersService, locationsService) {
        this.usersService = usersService;
        this.locationsService = locationsService;
    }
    async getLastLocation(id) {
        await this.usersService.findById(id);
        return this.locationsService.findLastByUserId(id);
    }
    async getHistory(id) {
        await this.usersService.findById(id);
        return this.locationsService.findHistoryByUserId(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(':id/last-location'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getLastLocation", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getHistory", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => locations_service_1.LocationsService))),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        locations_service_1.LocationsService])
], UsersController);
//# sourceMappingURL=users.controller.js.map