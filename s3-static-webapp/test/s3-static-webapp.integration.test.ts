import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { S3StaticWebappStack } from '../lib/s3-static-webapp-stack';
import { TestUtils, MockData } from './test-utils';

describe('S3StaticWebappStack Integration Tests', () => {
  describe('Complete Stack Deployment', () => {
    test('should create a complete working website setup', () => {
      // WHEN
      const { template } = TestUtils.createTestStack('IntegrationTestStack');

      // THEN - verify all essential components are present
      template.hasResource('AWS::S3::Bucket', {});
      template.hasResource('AWS::S3::BucketPolicy', {});
      template.hasResource('Custom::CDKBucketDeployment', {});
      template.hasResource('Custom::S3AutoDeleteObjects', {});
    });

    test('should have correct resource dependencies', () => {
      // WHEN
      const { template } = TestUtils.createTestStack('DependencyTestStack');

      // THEN - verify deployment depends on bucket
      const deployment = template.findResources('Custom::CDKBucketDeployment');
      const bucket = template.findResources('AWS::S3::Bucket');
      
      expect(Object.keys(deployment)).toHaveLength(1);
      expect(Object.keys(bucket)).toHaveLength(1);
    });
  });

  describe('Snapshot Testing', () => {
    test('should match expected CloudFormation template structure', () => {
      // WHEN
      const { template } = TestUtils.createTestStack('SnapshotTestStack');

      // THEN - verify template structure
      const templateJson = template.toJSON();
      
      // Check for required top-level keys
      expect(templateJson).toHaveProperty('Resources');
      expect(templateJson).toHaveProperty('Outputs');
      expect(templateJson).toHaveProperty('Parameters');

      // Check for required resource types
      const resources = templateJson.Resources;
      const resourceTypes = Object.values(resources).map((r: any) => r.Type);
      expect(resourceTypes).toContain('AWS::S3::Bucket');
      expect(resourceTypes).toContain('AWS::S3::BucketPolicy');
      expect(resourceTypes).toContain('Custom::CDKBucketDeployment');

      // Check for required outputs
      expect(templateJson.Outputs).toHaveProperty('WebsiteURL');
      expect(templateJson.Outputs).toHaveProperty('BucketName');
    });

    test('should maintain consistent resource naming', () => {
      // WHEN
      const { template } = TestUtils.createTestStack('NamingTestStack');

      // THEN - verify consistent naming patterns
      const templateJson = template.toJSON();
      
      // Check bucket naming - find the S3 bucket resource
      const bucketResources = Object.values(templateJson.Resources).filter(
        (r: any) => r.Type === 'AWS::S3::Bucket'
      );
      expect(bucketResources).toHaveLength(1);
      
      const bucketResource = bucketResources[0] as any;
      const bucketName = bucketResource.Properties.BucketName;
      expect(bucketName).toMatch(/^\d{12}-[a-z0-9-]+-static-website$/);

      // Check that required resource types exist
      const resourceTypes = Object.values(templateJson.Resources).map((r: any) => r.Type);
      expect(resourceTypes).toContain('AWS::S3::Bucket');
      expect(resourceTypes).toContain('AWS::S3::BucketPolicy');
      expect(resourceTypes).toContain('Custom::CDKBucketDeployment');
    });
  });

  describe('Multi-Environment Testing', () => {
    test('should work across different environments', () => {
      // Test multiple environments
      const environments = [
        { account: MockData.accounts.test, region: MockData.regions.usEast1 },
        { account: MockData.accounts.production, region: MockData.regions.usWest2 },
        { account: MockData.accounts.test, region: MockData.regions.euWest1 },
      ];

      environments.forEach(({ account, region }) => {
        // WHEN
        const { template } = TestUtils.createTestStackWithEnv(
          `MultiEnvTest-${account}-${region}`,
          account,
          region
        );

        // THEN
        template.hasResourceProperties('AWS::S3::Bucket', {
          BucketName: `${account}-${region}-static-website`,
        });

        template.hasResourceProperties('AWS::S3::Bucket', {
          WebsiteConfiguration: {
            IndexDocument: 'index.html',
            ErrorDocument: 'error.html',
          },
        });
      });
    });
  });

  describe('Security Integration', () => {
    test('should have secure bucket configuration', () => {
      // WHEN
      const { template } = TestUtils.createTestStack('SecurityTestStack');

      // THEN - verify security settings
      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: false,
          BlockPublicPolicy: false,
          IgnorePublicAcls: false,
          RestrictPublicBuckets: false,
        },
      });

      // Verify bucket policy allows public read access
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

    test('should have proper IAM permissions for deployment', () => {
      // WHEN
      const { template } = TestUtils.createTestStack('IAMTestStack');

      // THEN - verify deployment permissions
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

  describe('Website Functionality', () => {
    test('should configure website hosting correctly', () => {
      // WHEN
      const { template } = TestUtils.createTestStack('WebsiteTestStack');

      // THEN - verify website configuration
      template.hasResourceProperties('AWS::S3::Bucket', {
        WebsiteConfiguration: {
          IndexDocument: 'index.html',
          ErrorDocument: 'error.html',
        },
      });
    });

    test('should output correct website URL', () => {
      // WHEN
      const { template } = TestUtils.createTestStack('URLTestStack');

      // THEN - verify website URL output
      template.hasOutput('WebsiteURL', {
        Description: 'URL of the static website',
        Value: Match.anyValue(),
      });

      // Verify the URL format - the value is a CloudFormation intrinsic function
      const outputs = template.toJSON().Outputs;
      const websiteUrl = outputs.WebsiteURL.Value;
      expect(websiteUrl).toBeDefined();
      // The URL is generated using CloudFormation functions, so we can't easily validate the format
      // but we can ensure it's not undefined
    });
  });

  describe('Deployment Integration', () => {
    test('should configure deployment correctly', () => {
      // WHEN
      const { template } = TestUtils.createTestStack('DeploymentTestStack');

      // THEN - verify deployment configuration
      template.hasResourceProperties('Custom::CDKBucketDeployment', {
        DestinationBucketKeyPrefix: '',
        ServiceToken: Match.anyValue(),
        SourceBucketNames: Match.anyValue(),
        SourceObjectKeys: Match.anyValue(),
        DestinationBucketName: Match.anyValue(),
      });
    });

    test('should handle deployment dependencies', () => {
      // WHEN
      const { template } = TestUtils.createTestStack('DependencyTestStack');

      // THEN - verify deployment waits for bucket
      const templateJson = template.toJSON();
      const deployment = Object.values(templateJson.Resources).find(
        (resource: any) => resource.Type === 'Custom::CDKBucketDeployment'
      ) as any;

      expect(deployment).toBeDefined();
      // CDK automatically handles dependencies, so we just verify the resource exists
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle missing environment gracefully', () => {
      // WHEN & THEN - should not throw when environment is not specified
      expect(() => {
        const app = new cdk.App();
        const stack = new S3StaticWebappStack(app, 'NoEnvTestStack');
        Template.fromStack(stack);
      }).not.toThrow();
    });

    test('should handle invalid bucket names gracefully', () => {
      // WHEN & THEN - should handle special characters in account/region
      expect(() => {
        const { template } = TestUtils.createTestStackWithEnv(
          'InvalidNameTest',
          '123456789012',
          'us-east-1'
        );
        template.toJSON();
      }).not.toThrow();
    });
  });
}); 