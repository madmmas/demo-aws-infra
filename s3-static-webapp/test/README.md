# S3 Static Webapp - Testing Guide

This directory contains comprehensive tests for the S3 Static Webapp CDK stack.

## Test Structure

### Files
- `s3-static-webapp.test.ts` - Main unit tests for the stack
- `s3-static-webapp.integration.test.ts` - Integration and end-to-end tests
- `test-utils.ts` - Shared test utilities and helper functions
- `setup.ts` - Jest configuration and global test setup

## Test Categories

### 1. Unit Tests (`s3-static-webapp.test.ts`)
- **S3 Bucket Tests**: Verify bucket creation, properties, and configuration
- **Deployment Tests**: Test S3 deployment functionality
- **Output Tests**: Verify CloudFormation outputs
- **Security Tests**: Validate security configurations
- **Error Handling**: Test edge cases and error scenarios

### 2. Integration Tests (`s3-static-webapp.integration.test.ts`)
- **Complete Stack Deployment**: End-to-end stack validation
- **Snapshot Testing**: Template structure validation
- **Multi-Environment Testing**: Cross-region and cross-account testing
- **Security Integration**: Comprehensive security validation
- **Website Functionality**: Website hosting configuration tests

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Files
```bash
npm test -- s3-static-webapp.test.ts
npm test -- s3-static-webapp.integration.test.ts
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests Verbosely
```bash
npm test -- --verbose
```

## Test Utilities

### TestUtils Class
Provides helper methods for creating test stacks:

```typescript
// Create default test stack
const { app, stack, template } = TestUtils.createTestStack();

// Create test stack with custom environment
const { app, stack, template } = TestUtils.createTestStackWithEnv(
  'MyStack',
  '123456789012',
  'us-east-1'
);
```

### Mock Data
Predefined test data for consistent testing:

```typescript
import { MockData } from './test-utils';

// Use predefined accounts and regions
const testAccount = MockData.accounts.test;
const usEast1 = MockData.regions.usEast1;
```

### Test Constants
Common constants for validation:

```typescript
import { TestConstants } from './test-utils';

// Validate bucket names and URLs
expect(bucketName).toMatch(TestConstants.EXPECTED_BUCKET_NAME_PATTERN);
expect(websiteUrl).toMatch(TestConstants.EXPECTED_WEBSITE_URL_PATTERN);
```

## Custom Matchers

The test setup includes custom Jest matchers:

```typescript
// Validate bucket names
expect(bucketName).toBeValidBucketName();

// Validate website URLs
expect(websiteUrl).toBeValidWebsiteUrl();
```

## Best Practices

### 1. Test Organization
- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks
- Follow the AAA pattern: Arrange, Act, Assert

### 2. Test Isolation
- Each test should be independent
- Use `beforeEach` to set up fresh test data
- Avoid shared state between tests

### 3. Assertions
- Use specific assertions rather than generic ones
- Test both positive and negative cases
- Validate resource properties, not just existence

### 4. Coverage
- Aim for 80% code coverage
- Test all public methods and constructors
- Include edge cases and error scenarios

### 5. Performance
- Keep tests fast and efficient
- Avoid unnecessary resource creation
- Use mocks for external dependencies when appropriate

## Example Test Pattern

```typescript
describe('Feature Name', () => {
  let app: cdk.App;
  let stack: S3StaticWebappStack;
  let template: Template;

  beforeEach(() => {
    // Arrange
    app = new cdk.App();
    stack = new S3StaticWebappStack(app, 'TestStack', {
      env: { account: '123456789012', region: 'us-east-1' }
    });
    template = Template.fromStack(stack);
  });

  test('should create expected resource', () => {
    // Act & Assert
    template.hasResourceProperties('AWS::S3::Bucket', {
      // expected properties
    });
  });
});
```

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Ensure all imports are correct and types are properly defined
2. **Jest Configuration**: Verify `jest.config.js` is properly configured
3. **CDK Version**: Ensure CDK version compatibility between test and implementation
4. **Environment Variables**: Set required environment variables in test setup

### Debug Mode
Run tests in debug mode for more detailed output:

```bash
npm test -- --verbose --detectOpenHandles
```

## Contributing

When adding new tests:

1. Follow the existing test patterns
2. Add appropriate test coverage
3. Update this README if adding new test categories
4. Ensure all tests pass before submitting
5. Add integration tests for new features 