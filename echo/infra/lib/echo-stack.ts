import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

import * as lambda from 'aws-cdk-lib/aws-lambda';


export class EchoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    let lambdaFn = new lambda.Function(this, 'EchoLambda', {
      // my package is a binary, may as well use the latesta nd greatest...
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: 'bootstrap',
      code: lambda.Code.fromAsset('../../echo/echo.zip'),
      // Cheaper computer cost
      architecture: lambda.Architecture.ARM_64,
    });


    let rest = new apigw.LambdaRestApi(this, 'EchoApi', {
      handler: lambdaFn,
      proxy: true,
      endpointConfiguration: {
        types: [apigw.EndpointType.REGIONAL]
      }
    });

    let http = new apigwv2.HttpApi(this, 'EchoHttpApi', {
      defaultIntegration: new HttpLambdaIntegration('EchoFunc',lambdaFn)
     });

  }
}
