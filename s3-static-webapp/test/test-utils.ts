import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { S3StaticWebappStack } from '../lib/s3-static-webapp-stack';

/**
 * Test utilities for S3StaticWebappStack testing
 */
export class TestUtils {
  /**
   * Creates a test stack with default environment
   */
  static createTestStack(stackName: string = 'TestStack'): {
    app: cdk.App;
    stack: S3StaticWebappStack;
    template: Template;
  } {
    const app = new cdk.App();
    const stack = new S3StaticWebappStack(app, stackName, {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
    const template = Template.fromStack(stack);

    return { app, stack, template };
  }

  /**
   * Creates a test stack with custom environment
   */
  static createTestStackWithEnv(
    stackName: string,
    account: string,
    region: string
  ): {
    app: cdk.App;
    stack: S3StaticWebappStack;
    template: Template;
  } {
    const app = new cdk.App();
    const stack = new S3StaticWebappStack(app, stackName, {
      env: {
        account,
        region,
      },
    });
    const template = Template.fromStack(stack);

    return { app, stack, template };
  }

  /**
   * Expected bucket name pattern
   */
  static getExpectedBucketName(account: string, region: string): string {
    return `${account}-${region}-static-website`;
  }

  /**
   * Expected website URL pattern
   */
  static getExpectedWebsiteUrl(bucketName: string, region: string): string {
    return `${bucketName}.s3-website-${region}.amazonaws.com`;
  }

  /**
   * Common S3 bucket properties for testing
   */
  static getExpectedS3BucketProperties() {
    return {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: false,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: false,
      },
      WebsiteConfiguration: {
        IndexDocument: 'index.html',
        ErrorDocument: 'error.html',
      },
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete',
    };
  }

  /**
   * Common bucket policy properties for testing
   */
  static getExpectedBucketPolicyProperties() {
    return {
      PolicyDocument: {
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: expect.stringMatching(/.*\/\*/),
          },
        ],
      },
    };
  }

  /**
   * Common deployment properties for testing
   */
  static getExpectedDeploymentProperties() {
    return {
      ServiceToken: expect.any(String),
      SourceBucketNames: expect.any(Array),
      SourceObjectKeys: expect.any(Array),
      DestinationBucketName: expect.any(String),
      DestinationBucketKeyPrefix: '',
    };
  }
}

/**
 * Mock data for testing
 */
export const MockData = {
  accounts: {
    test: '123456789012',
    production: '987654321098',
  },
  regions: {
    usEast1: 'us-east-1',
    usWest2: 'us-west-2',
    euWest1: 'eu-west-1',
    apSoutheast1: 'ap-southeast-1',
  },
  stackNames: {
    test: 'TestStack',
    production: 'ProductionStack',
    staging: 'StagingStack',
  },
};

/**
 * Test constants
 */
export const TestConstants = {
  EXPECTED_INDEX_DOCUMENT: 'index.html',
  EXPECTED_ERROR_DOCUMENT: 'error.html',
  EXPECTED_BUCKET_NAME_PATTERN: /^\d{12}-[a-z0-9-]+-static-website$/,
  EXPECTED_WEBSITE_URL_PATTERN: /^[a-z0-9-]+\.s3-website-[a-z0-9-]+\.amazonaws\.com$/,
}; 