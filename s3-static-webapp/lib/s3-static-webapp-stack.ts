import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class S3StaticWebappStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket for static webapp
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `${this.account}-${this.region}-static-website`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For demo purposes - change to RETAIN for production
      autoDeleteObjects: true, // For demo purposes - change to false for production
      
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      }),
    });

    // Deploy website files to S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./web')],
      destinationBucket: websiteBucket,
      destinationKeyPrefix: '', // Upload files to root of bucket
    });

    // Output the website URL
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: websiteBucket.bucketWebsiteDomainName,
      description: 'URL of the static website',
    });

    // Output the bucket name
    new cdk.CfnOutput(this, 'BucketName', {
      value: websiteBucket.bucketName,
      description: 'Name of the S3 bucket',
    });
  }
}
