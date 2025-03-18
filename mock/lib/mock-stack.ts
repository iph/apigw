import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';


export class MockStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a mock integration that always returns 200
    const mock = new apigw.MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseTemplates: {
          'application/json': '{"message": "OK"}'
        }
      }],
      passthroughBehavior: apigw.PassthroughBehavior.NEVER,
      requestTemplates: {
        'application/json': '{"statusCode": 200}'
      }
    });

    // Create a method response for the integration
    const methodResponses = [{
      statusCode: '200',
      responseModels: {
        'application/json': apigw.Model.EMPTY_MODEL
      }
    }];

    // Create the REST API with the mock integration as default
    const resty = new apigw.RestApi(this, 'EchoEdgeTenant', {
      endpointConfiguration: {
        types: [apigw.EndpointType.REGIONAL]
      },
      defaultIntegration: mock,
      defaultMethodOptions: {
        methodResponses: methodResponses
      }
    });

  }
}
