"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const users_module_1 = require("./users/users.module");
const locations_module_1 = require("./locations/locations.module");
const auth_module_1 = require("./auth/auth.module");
const admin_module_1 = require("./admin/admin.module");
const isTest = process.env.NODE_ENV === 'test';
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: isTest ? (process.env.DB_TEST_HOST ?? 'localhost') : (process.env.DB_HOST ?? 'localhost'),
                port: parseInt(isTest ? (process.env.DB_TEST_PORT ?? '5432') : (process.env.DB_PORT ?? '5432'), 10),
                username: isTest ? (process.env.DB_TEST_USER ?? 'postgres') : (process.env.DB_USER ?? 'postgres'),
                password: isTest ? (process.env.DB_TEST_PASS ?? 'postgres') : (process.env.DB_PASS ?? 'postgres'),
                database: isTest ? (process.env.DB_TEST_NAME ?? 'postgres_test') : (process.env.DB_NAME ?? 'postgres'),
                autoLoadEntities: true,
                synchronize: isTest,
                extra: { connectionTimeoutMillis: 10000 },
            }),
            users_module_1.UsersModule,
            locations_module_1.LocationsModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map