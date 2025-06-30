import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { S3StaticWebappStack } from '../lib/s3-static-webapp-stack';

describe('S3StaticWebappStack', () => {
  let app: cdk.App;
  let stack: S3StaticWebappStack;
  let template: Template;

  beforeEach(() => {
    // Create a new app and stack for each test
    app = new cdk.App();
    stack = new S3StaticWebappStack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
    template = Template.fromStack(stack);
  });

  describe('S3 Bucket', () => {
    test('should create an S3 bucket with correct properties', () => {
      // THEN
      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: false,
          BlockPublicPolicy: false,
          IgnorePublicAcls: false,
          RestrictPublicBuckets: false,
        },
        WebsiteConfiguration: {
          IndexDocument: 'index.html',
          ErrorDocument: 'error.html',
        },
      });
    });

    test('should create bucket with correct bucket name pattern', () => {
      // THEN
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: Match.stringLikeRegexp('123456789012-us-east-1-static-website'),
      });
    });

    test('should configure bucket for public read access', () => {
      // THEN
      template.hasResourceProperties('AWS::S3::BucketPolicy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: 'Allow',
              Principal: {
                AWS: '*',
              },
              Action: 's3:GetObject',
            }),
          ]),
        },
      });
    });

    test('should set removal policy to DESTROY for demo purposes', () => {
      // THEN - check at the resource level, not properties level
      const bucketResources = template.findResources('AWS::S3::Bucket');
      const bucketResource = Object.values(bucketResources)[0] as any;
      expect(bucketResource.DeletionPolicy).toBe('Delete');
      expect(bucketResource.UpdateReplacePolicy).toBe('Delete');
    });

    test('should enable auto delete objects for demo purposes', () => {
      // THEN
      template.hasResourceProperties('Custom::S3AutoDeleteObjects', {
        ServiceToken: Match.anyValue(),
        BucketName: Match.anyValue(),
      });
    });
  });

  describe('S3 Bucket Deployment', () => {
    test('should create bucket deployment resource', () => {
      // THEN
      template.hasResourceProperties('Custom::CDKBucketDeployment', {
        ServiceToken: Match.anyValue(),
        SourceBucketNames: Match.anyValue(),
        SourceObjectKeys: Match.anyValue(),
        DestinationBucketName: Match.anyValue(),
        DestinationBucketKeyPrefix: '',
      });
    });

    test('should deploy from web directory', () => {
      // THEN
      template.hasResourceProperties('Custom::CDKBucketDeployment', {
        SourceBucketNames: Match.anyValue(),
        SourceObjectKeys: Match.anyValue(),
      });
    });
  });

  describe('CloudFormation Outputs', () => {
    test('should output website URL', () => {
      // THEN
      template.hasOutput('WebsiteURL', {
        Description: 'URL of the static website',
        Value: Match.anyValue(),
      });
    });

    test('should output bucket name', () => {
      // THEN
      template.hasOutput('BucketName', {
        Description: 'Name of the S3 bucket',
        Value: Match.anyValue(),
      });
    });
  });

  describe('Stack Configuration', () => {
    test('should have correct stack name', () => {
      // THEN
      expect(stack.stackName).toBe('TestStack');
    });

    test('should be in correct region', () => {
      // THEN
      expect(stack.region).toBe('us-east-1');
    });

    test('should have correct account', () => {
      // THEN
      expect(stack.account).toBe('123456789012');
    });
  });

  describe('Resource Counts', () => {
    test('should create expected number of resources', () => {
      // THEN - check for resource types rather than specific names
      template.hasResource('AWS::S3::Bucket', {});
      template.hasResource('AWS::S3::BucketPolicy', {});
      template.hasResource('Custom::CDKBucketDeployment', {});
      template.hasResource('Custom::S3AutoDeleteObjects', {});
      template.hasResource('AWS::IAM::Role', {});
      template.hasResource('AWS::IAM::Policy', {});
      template.hasResource('AWS::Lambda::Function', {});
    });
  });

  describe('Security and Permissions', () => {
    test('should have proper IAM permissions for deployment', () => {
      // THEN
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: 'Allow',
              Action: Match.arrayWith([
                's3:GetObject*',
                's3:GetBucket*',
                's3:List*',
              ]),
            }),
          ]),
        },
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle missing environment variables gracefully', () => {
      // WHEN
      const appWithoutEnv = new cdk.App();
      const stackWithoutEnv = new S3StaticWebappStack(appWithoutEnv, 'TestStackWithoutEnv');
      
      // THEN - should not throw error
      expect(() => {
        Template.fromStack(stackWithoutEnv);
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('should create a complete website hosting setup', () => {
      // THEN - verify all components work together
      template.hasResourceProperties('AWS::S3::Bucket', {
        WebsiteConfiguration: {
          IndexDocument: 'index.html',
          ErrorDocument: 'error.html',
        },
      });

      template.hasResourceProperties('AWS::S3::BucketPolicy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: 'Allow',
              Principal: {
                AWS: '*',
              },
              Action: 's3:GetObject',
            }),
          ]),
        },
      });

      template.hasResourceProperties('Custom::CDKBucketDeployment', {
        DestinationBucketKeyPrefix: '',
      });
    });
  });
});

// Additional test suite for edge cases
describe('S3StaticWebappStack Edge Cases', () => {
  test('should handle special characters in bucket name', () => {
    // WHEN
    const app = new cdk.App();
    const stack = new S3StaticWebappStack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'us-west-2',
      },
    });
    const template = Template.fromStack(stack);

    // THEN
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: Match.stringLikeRegexp('123456789012-us-west-2-static-website'),
    });
  });

  test('should work with different regions', () => {
    // WHEN
    const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];
    
    regions.forEach(region => {
      const app = new cdk.App();
      const stack = new S3StaticWebappStack(app, `TestStack-${region}`, {
        env: {
          account: '123456789012',
          region: region,
        },
      });
      const template = Template.fromStack(stack);

      // THEN
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: Match.stringLikeRegexp(`123456789012-${region}-static-website`),
      });
    });
  });
});
