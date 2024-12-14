import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';


export class Ipv6Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const resty = new apigw.RestApi(this, 'MyRestApi', {
      endpointConfiguration: {
        types: [apigw.EndpointType.REGIONAL]
      }
    });

    resty.root.addMethod('ANY', new apigw.MockIntegration({
      integrationResponses: [{statusCode: '200'}],
      passthroughBehavior: apigw.PassthroughBehavior.WHEN_NO_MATCH,
      requestTemplates: {
        'application/json': '{"statusCode": 200 }',
      }
    }));


    let lambdaFn = new lambda.Function(this, 'EchoLambda', {
      // my package is a binary, may as well use the latesta nd greatest...
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: 'bootstrap',
      code: lambda.Code.fromAsset('../../echo/echo.zip'),
      architecture: lambda.Architecture.X86_64,
    });
  }
}
