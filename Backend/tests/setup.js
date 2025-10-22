// Test setup and global configurations
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/ecommerce_test';
process.env.JWT_SECRET = 'test_jwt_secret_key';
process.env.JWT_EXPIRE = '7d';

// Increase timeout for database operations
jest.setTimeout(30000);

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
