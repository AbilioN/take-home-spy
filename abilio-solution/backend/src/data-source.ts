import { DataSource } from 'typeorm';

const isTest = process.env.NODE_ENV === 'test';

export default new DataSource({
  type: 'postgres',
  host: isTest ? (process.env.DB_TEST_HOST ?? 'localhost') : (process.env.DB_HOST ?? 'localhost'),
  port: parseInt(
    isTest ? (process.env.DB_TEST_PORT ?? '5432') : (process.env.DB_PORT ?? '5432'),
    10,
  ),
  username: isTest ? (process.env.DB_TEST_USER ?? 'postgres') : (process.env.DB_USER ?? 'postgres'),
  password: isTest ? (process.env.DB_TEST_PASS ?? 'postgres') : (process.env.DB_PASS ?? 'postgres'),
  database: isTest ? (process.env.DB_TEST_NAME ?? 'abilio') : (process.env.DB_NAME ?? 'postgres'),
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
});
