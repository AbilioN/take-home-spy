import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Location } from '../src/locations/entities/location.entity';

describe('Locations & Users (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    await dataSource.getRepository(Location).createQueryBuilder().delete().execute();
    await dataSource.getRepository(User).createQueryBuilder().delete().execute();

    const registerRes = await request(app.getHttpServer())
      .post('/users/register')
      .send({ email: 'e2e-user@test.com', password: 'password123' });
    createdUserId = registerRes.body.id;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('POST /locations', () => {
    it('should create a location successfully', () => {
      return request(app.getHttpServer())
        .post('/locations')
        .send({
          userId: createdUserId,
          latitude: 40.7128,
          longitude: -74.006,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            userId: createdUserId,
            latitude: 40.7128,
            longitude: -74.006,
          });
          expect(res.body.id).toBeDefined();
          expect(res.body.createdAt).toBeDefined();
        });
    });

    it('should fail with invalid payload (missing userId)', () => {
      return request(app.getHttpServer())
        .post('/locations')
        .send({ latitude: 40.7128, longitude: -74.006 })
        .expect(400);
    });

    it('should fail with invalid payload (invalid userId)', () => {
      return request(app.getHttpServer())
        .post('/locations')
        .send({
          userId: 'not-a-uuid',
          latitude: 40.7128,
          longitude: -74.006,
        })
        .expect(400);
    });

    it('should fail with invalid payload (latitude out of range)', () => {
      return request(app.getHttpServer())
        .post('/locations')
        .send({
          userId: createdUserId,
          latitude: 100,
          longitude: -74.006,
        })
        .expect(400);
    });

    it('should fail with invalid payload (longitude out of range)', () => {
      return request(app.getHttpServer())
        .post('/locations')
        .send({
          userId: createdUserId,
          latitude: 40.7128,
          longitude: 200,
        })
        .expect(400);
    });

    it('should fail with non-existent userId', () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .post('/locations')
        .send({
          userId: fakeUuid,
          latitude: 40.7128,
          longitude: -74.006,
        })
        .expect(404);
    });
  });

  describe('GET /users/:id/last-location', () => {
    it('should return latest location', async () => {
      const locRepo = dataSource.getRepository(Location);
      await locRepo.save(
        locRepo.create({
          userId: createdUserId,
          latitude: 1,
          longitude: 1,
        }),
      );
      await new Promise((r) => setTimeout(r, 15));
      await locRepo.save(
        locRepo.create({
          userId: createdUserId,
          latitude: 2,
          longitude: 2,
        }),
      );

      const res = await request(app.getHttpServer())
        .get(`/users/${createdUserId}/last-location`)
        .expect(200);

      expect(res.body).toMatchObject({
        userId: createdUserId,
        latitude: 2,
        longitude: 2,
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
    });

    it('should return null when user has no locations', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdUserId}/last-location`)
        .expect(200)
        .expect((res) => {
          const empty =
            res.body == null ||
            (typeof res.body === 'object' && Object.keys(res.body).length === 0);
          expect(empty).toBe(true);
        });
    });

    it('should return 404 for non-existent user', () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/users/${fakeUuid}/last-location`)
        .expect(404);
    });
  });

  describe('GET /users/:id/history', () => {
    it('should return ordered list of locations (newest first)', async () => {
      const locRepo = dataSource.getRepository(Location);
      await locRepo.save(
        locRepo.create({
          userId: createdUserId,
          latitude: 10,
          longitude: 10,
        }),
      );
      await new Promise((r) => setTimeout(r, 15));
      await locRepo.save(
        locRepo.create({
          userId: createdUserId,
          latitude: 20,
          longitude: 20,
        }),
      );

      const res = await request(app.getHttpServer())
        .get(`/users/${createdUserId}/history`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toMatchObject({ latitude: 20, longitude: 20 });
      expect(res.body[1]).toMatchObject({ latitude: 10, longitude: 10 });
    });

    it('should return empty array when user has no locations', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdUserId}/history`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([]);
        });
    });

    it('should return 404 for non-existent user', () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/users/${fakeUuid}/history`)
        .expect(404);
    });
  });
});
