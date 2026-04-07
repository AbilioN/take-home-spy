import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Admin } from '../src/admin/entities/admin.entity';

describe('Admin login (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

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
    await dataSource.getRepository(Admin).createQueryBuilder().delete().execute();
    const hash = await bcrypt.hash('admin123', 10);
    await dataSource.getRepository(Admin).save(
      dataSource.getRepository(Admin).create({
        email: 'admin-e2e@test.com',
        password: hash,
      }),
    );
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('POST /admin/login returns a non-empty token', () => {
    return request(app.getHttpServer())
      .post('/admin/login')
      .send({ email: 'admin-e2e@test.com', password: 'admin123' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({ success: true });
        expect(typeof res.body.token).toBe('string');
        expect(res.body.token.length).toBeGreaterThan(10);
        expect(res.body.accessToken).toBe(res.body.token);
        expect(res.headers['x-admin-token']).toBe(res.body.token);
      });
  });
});
