use aws_lambda_events::{
    event::eventbridge::EventBridgeEvent,
};
use lambda_runtime::{run, service_fn, Error, LambdaEvent};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Didn't use ApiGatewayProxyRequest as it uses HeaderMap which will attempt to transform the headers to only lowercase
#[derive(Debug, Deserialize, Serialize, Clone)]
struct EchoRequest {
    body: Option<String>,
    headers: HashMap<String, String>,
    #[serde(rename = "multiValueHeaders")]
    multi_value_headers: Option<HashMap<String, Vec<String>>>,
}

async fn function_handler(
    event: LambdaEvent<EventBridgeEvent>,
) -> Result<(), Error> {
    // Extract some useful information from the request
    let request = event.payload;

    Ok(())
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
