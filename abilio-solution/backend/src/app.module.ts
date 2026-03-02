import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { LocationsModule } from './locations/locations.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { TrackingSettingsModule } from './tracking-settings/tracking-settings.module';

const isTest = process.env.NODE_ENV === 'test';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'admin-ui'),
      serveRoot: '/dashboard',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: isTest ? (process.env.DB_TEST_HOST ?? 'localhost') : (process.env.DB_HOST ?? 'localhost'),
      port: parseInt(
        isTest ? (process.env.DB_TEST_PORT ?? '5432') : (process.env.DB_PORT ?? '5432'),
        10,
      ),
      username: isTest ? (process.env.DB_TEST_USER ?? 'postgres') : (process.env.DB_USER ?? 'postgres'),
      password: isTest ? (process.env.DB_TEST_PASS ?? 'postgres') : (process.env.DB_PASS ?? 'postgres'),
      database: isTest ? (process.env.DB_TEST_NAME ?? 'postgres_test') : (process.env.DB_NAME ?? 'postgres'),
      autoLoadEntities: true,
      synchronize: isTest,
      extra: { connectionTimeoutMillis: 10000 },
    }),
    UsersModule,
    LocationsModule,
    AuthModule,
    TrackingSettingsModule,
    AdminModule,
  ],
})
export class AppModule {}
