use std::collections::HashMap;

use aws_lambda_events::{event::apigw::ApiGatewayProxyResponse, http::HeaderMap, encodings::Body};
use lambda_runtime::{run, service_fn, Error, LambdaEvent};
use serde::{Serialize, Deserialize};

#[derive(Debug, Deserialize, Serialize)]
struct EchoResponse {
    body: String,
    headers: HashMap<String, String>,
    #[serde(rename = "multiValueHeaders")]
    multi_value_headers: HashMap<String, Vec<String>>,
}

#[derive(Debug, Deserialize, Serialize)]
struct EchoRequest {
    body: Option<String>,
    headers: HashMap<String, String>,
    #[serde(rename = "multiValueHeaders")]
    multi_value_headers: Option<HashMap<String, Vec<String>>>,
}

async fn function_handler(event: LambdaEvent<EchoRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    // Extract some useful information from the request
    let request = event.payload;
    println!("request: {:?}", request);
    let response = ApiGatewayProxyResponse{
        status_code: 200,
        headers: HeaderMap::new(),
        multi_value_headers: HeaderMap::new(),
        body: Some(Body::from(serde_json::to_string(&request).unwrap())),
        is_base64_encoded: false,
    };
    println!("response: {:?}", response);
    Ok(response)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        // disable printing the name of the module in every log line.
        .with_target(false)
        // disabling time is handy because CloudWatch will add the ingestion time.
        .without_time()
        .init();

    run(service_fn(function_handler)).await
}
