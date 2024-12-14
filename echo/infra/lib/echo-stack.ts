import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import {DomainName, EndpointType, SecurityPolicy} from 'aws-cdk-lib/aws-apigateway';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import {MappingValue, ParameterMapping} from 'aws-cdk-lib/aws-apigatewayv2';
import {HttpLambdaIntegration, HttpUrlIntegration} from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {CfnOutput} from "aws-cdk-lib";


export class EchoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    let lambdaFn = new lambda.Function(this, 'EchoLambda', {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: 'bootstrap',
      code: lambda.Code.fromAsset('../../echo/echo.zip'),
      architecture: lambda.Architecture.X86_64,
    });

    let lambdaIntegration = new apigw.LambdaIntegration(lambdaFn, {
      requestParameters: {
        'integration.request.header.tenancy': 'method.request.header.tenancy'
      },
    });

    let resty = new apigw.RestApi(this, 'EchoTenant', {
      endpointConfiguration: {
        types: [apigw.EndpointType.REGIONAL]
      },
      defaultIntegration:  lambdaIntegration
    });

    resty.root.addProxy();


    let parameterMappings = new ParameterMapping();
    parameterMappings.appendHeader('api_gateway_request_time', MappingValue.contextVariable('requestTimeEpoch'))

    let httpRaw = new apigwv2.HttpApi(this, 'EchoWithBackend', {
      defaultIntegration: new HttpUrlIntegration('CoreIntegration', 'https://seamyers.stormlight.lambda.aws.a2z.com', {
        parameterMapping: new ParameterMapping()
            .appendHeader('api_gateway_request_time', MappingValue.contextVariable('requestTimeEpoch'))
      })
    })
    if (httpRaw.defaultStage === undefined) {
      throw new Error('Stage not found');
    }
    let cfnStage = (httpRaw.defaultStage.node.defaultChild as apigwv2.CfnStage);
    new CfnOutput(this, 'IdHttp',{
      value: cfnStage.ref
    })


    // Create VPC for private API Gateway
    const vpc = new ec2.Vpc(this, 'PrivateApiVpc', {
      maxAzs: 2,
    });

    // Create VPC endpoint for API Gateway
    const apiGatewayVpcEndpoint = vpc.addInterfaceEndpoint('ApiGatewayEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.APIGATEWAY
    });

    // Create private Network Load Balancer
    const nlb = new elbv2.NetworkLoadBalancer(this, 'PrivateNLB', {
      vpc,
      internetFacing: false,
      crossZoneEnabled: false,
    });

    // Create target group without targets
    const targetGroup = new elbv2.NetworkTargetGroup(this, 'EmptyTargetGroup', {
      vpc,
      port: 443,
      protocol: elbv2.Protocol.TCP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        enabled: true,
        protocol: elbv2.Protocol.TCP,
      }
    });

    // Add listener to NLB
    nlb.addListener('TCPListener', {
      port: 443,
      protocol: elbv2.Protocol.TCP,
      defaultTargetGroups: [targetGroup],
    });

    // Create private REST API
    let privateApi = new apigw.LambdaRestApi(this, 'PrivateEchoApi', {
      handler: lambdaFn,
      proxy: true,
      endpointConfiguration: {
        types: [EndpointType.PRIVATE],
        vpcEndpoints: [apiGatewayVpcEndpoint]
      },
      policy: new cdk.aws_iam.PolicyDocument({
        statements: [
          new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.DENY,
            principals: [new cdk.aws_iam.AnyPrincipal()],
            actions: ['execute-api:Invoke'],
            resources: ['execute-api:/*'],
            conditions: {
              StringNotEquals: {
                'aws:SourceVpc': vpc.vpcId
              }
            }
          }),
          new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            principals: [new cdk.aws_iam.AnyPrincipal()],
            actions: ['execute-api:Invoke'],
            resources: ['execute-api:/*']
          })
        ]
      })
    });

    // Output the NLB DNS name
    new CfnOutput(this, 'LoadBalancerDNS', {
      value: nlb.loadBalancerDnsName,
    });
  }
}
