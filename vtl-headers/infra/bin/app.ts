#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VtlHeadersStack } from '../lib/vtl-headers-stack';

const app = new cdk.App();
new VtlHeadersStack(app, 'VtlHeadersStack', {
  env: { account: '326750834372', region: 'us-west-2' },
});
