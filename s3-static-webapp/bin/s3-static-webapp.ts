#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { S3StaticWebappStack } from '../lib/s3-static-webapp-stack';

const app = new cdk.App();

new S3StaticWebappStack(app, 'S3StaticWebappStack', {});
