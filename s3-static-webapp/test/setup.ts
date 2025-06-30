// Test setup file for Jest
import '@jest/globals';

// Global test configuration
beforeAll(() => {
  // Set up any global test configuration
  process.env.CDK_DEFAULT_ACCOUNT = '123456789012';
  process.env.CDK_DEFAULT_REGION = 'us-east-1';
});

afterAll(() => {
  // Clean up any global test configuration
  delete process.env.CDK_DEFAULT_ACCOUNT;
  delete process.env.CDK_DEFAULT_REGION;
});

// Global test utilities
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Extend Jest matchers if needed
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidBucketName(): R;
      toBeValidWebsiteUrl(): R;
    }
  }
}

// Custom matchers
expect.extend({
  toBeValidBucketName(received: string) {
    const pass = /^\d{12}-[a-z0-9-]+-static-website$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid bucket name`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid bucket name`,
        pass: false,
      };
    }
  },
  toBeValidWebsiteUrl(received: string) {
    const pass = /^[a-z0-9-]+\.s3-website-[a-z0-9-]+\.amazonaws\.com$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid website URL`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid website URL`,
        pass: false,
      };
    }
  },
}); 