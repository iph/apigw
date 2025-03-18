#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MockStack } from '../lib/mock-stack';

const app = new cdk.App();
new MockStack(app, 'MockStack', {
});
