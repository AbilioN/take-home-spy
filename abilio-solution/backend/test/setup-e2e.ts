process.env.NODE_ENV = 'test';
process.env.DB_TEST_HOST = process.env.DB_TEST_HOST ?? 'localhost';
process.env.DB_TEST_PORT = process.env.DB_TEST_PORT ?? '5432';
process.env.DB_TEST_USER = process.env.DB_TEST_USER ?? 'postgres';
process.env.DB_TEST_PASS = process.env.DB_TEST_PASS ?? 'postgres';
process.env.DB_TEST_NAME = process.env.DB_TEST_NAME ?? 'abilio';
