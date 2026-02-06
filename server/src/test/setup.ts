import dotenv from 'dotenv';

dotenv.config();

process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'islandfund_test';
process.env.JWT_SECRET = 'test_secret_key_for_testing_only';

beforeAll(async () => {
  console.log('Test setup complete');
});

afterAll(async () => {
  const { testDb } = await import('./db');
  await testDb.close();
  console.log('Test cleanup complete');
});
