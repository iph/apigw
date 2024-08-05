import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import {HttpLambdaIntegration, HttpUrlIntegration} from 'aws-cdk-lib/aws-apigatewayv2-integrations';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import {HttpIntegration, MappingValue, ParameterMapping} from "aws-cdk-lib/aws-apigatewayv2";


export class EchoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    let lambdaFn = new lambda.Function(this, 'EchoLambda', {
      // my package is a binary, may as well use the latesta nd greatest...
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: 'bootstrap',
      code: lambda.Code.fromAsset('../../echo/echo.zip'),
      // Cheaper computer cost
      architecture: lambda.Architecture.X86_64,
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

    let parameterMappings = new ParameterMapping();
    parameterMappings.appendHeader('api_gateway_request_time', MappingValue.contextVariable('requestTimeEpoch'))

    let httpRaw = new apigwv2.HttpApi(this, 'EchoWithBackend', {
      defaultIntegration: new HttpUrlIntegration('CoreIntegration', 'https://seamyers.stormlight.lambda.aws.a2z.com', {
        parameterMapping: new ParameterMapping()
            .appendHeader('api_gateway_request_time', MappingValue.contextVariable('requestTimeEpoch'))
      })
    })
  }
}
