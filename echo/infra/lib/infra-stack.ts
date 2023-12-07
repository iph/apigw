import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

import * as lambda from 'aws-cdk-lib/aws-lambda';


export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    let lambdaFn = new lambda.Function(this, 'InfraLambda', {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: 'bootstrap',
      code: lambda.Code.fromAsset('../../echo/echo.zip'),
      architecture: lambda.Architecture.ARM_64,
    });


    let rest = new apigw.LambdaRestApi(this, 'InfraApi', {
      handler: lambdaFn,
      proxy: true,
      endpointConfiguration: {
        types: [apigw.EndpointType.REGIONAL]
      }
    });

    let http = new apigwv2.HttpApi(this, 'InfraHttpApi', {
      defaultIntegration: new HttpLambdaIntegration('hello',lambdaFn)
     });
    // example resource
    // const queue = new sqs.Queue(this, 'InfraQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
