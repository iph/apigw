import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { CfnOutput } from 'aws-cdk-lib';

export class VtlHeadersStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Reference the existing Lambda function (same as echo)
    const lambdaFn = lambda.Function.fromFunctionArn(
      this,
      'EchoLambda',
      'arn:aws:lambda:us-west-2:326750834372:function:Ipv6Canary-EchoLambda36664C86-TChqJHlUbMws'
    );

    // Create the REST API
    const api = new apigw.RestApi(this, 'VtlHeadersApi', {
      restApiName: 'VTL Headers Demo API',
      description: 'API Gateway with VTL request templates for header manipulation',
      endpointConfiguration: {
        types: [apigw.EndpointType.REGIONAL],
      },
    });

    // VTL Request Template that:
    // 1. Adds a new header: X-Custom-Added
    // 2. Modifies an existing header: User-Agent (appends text)
    // 3. Deletes a header: X-Delete-Me (by not including it in the mapping)
    const requestTemplate = `{
  "body": "$util.escapeJavaScript($input.body)",
  "headers": {
#set($allHeaders = $input.params().header)
#set($count = 0)
#foreach($headerName in $allHeaders.keySet())
  #if($headerName != "X-Delete-Me")
    #if($count > 0),#end
    #if($headerName == "User-Agent")
    "$util.escapeJavaScript($headerName)": "$util.escapeJavaScript($allHeaders.get($headerName)) [Modified-By-VTL]"
    #else
    "$util.escapeJavaScript($headerName)": "$util.escapeJavaScript($allHeaders.get($headerName))"
    #end
    #set($count = $count + 1)
  #end
#end
#if($count > 0),#end
    "X-Custom-Added": "AddedByVTL",
    "X-Request-Time": "$context.requestTimeEpoch",
    "X-Request-Id": "$context.requestId"
  },
  "multiValueHeaders": {},
  "requestContext": {
    "routeKey": "$context.resourcePath $context.httpMethod",
    "requestId": "$context.requestId",
    "time": "$context.requestTime",
    "timeEpoch": $context.requestTimeEpoch
  }
}`;

    // Create Lambda integration with VTL request template
    const lambdaIntegration = new apigw.LambdaIntegration(lambdaFn, {
      proxy: false,
      requestTemplates: {
        'application/json': requestTemplate,
      },
      passthroughBehavior: apigw.PassthroughBehavior.WHEN_NO_TEMPLATES,
      integrationResponses: [
        {
          statusCode: '200',
          responseTemplates: {
            'application/json': '$input.json("$")',
          },
        },
      ],
    });

    // Method responses
    const methodResponses = [
      {
        statusCode: '200',
        responseModels: {
          'application/json': apigw.Model.EMPTY_MODEL,
        },
      },
    ];

    // Add POST method to root
    api.root.addMethod('POST', lambdaIntegration, {
      methodResponses: methodResponses,
    });

    // Add GET method to root
    api.root.addMethod('GET', lambdaIntegration, {
      methodResponses: methodResponses,
    });

    // Add a proxy resource for any path
    const proxyResource = api.root.addProxy({
      defaultIntegration: lambdaIntegration,
      defaultMethodOptions: {
        methodResponses: methodResponses,
      },
      anyMethod: true,
    });

    // Output the API endpoint
    new CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'VTL Headers API Endpoint',
    });

    new CfnOutput(this, 'ApiId', {
      value: api.restApiId,
      description: 'API Gateway ID',
    });
  }
}
