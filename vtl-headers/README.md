# VTL Headers Demo

This CDK project demonstrates API Gateway VTL (Velocity Template Language) request templates that manipulate HTTP headers.

## Header Manipulation

The VTL request template performs three operations:

1. **Adds Headers**: 
   - `X-Custom-Added`: Static value "AddedByVTL"
   - `X-Request-Time`: Request timestamp from context
   - `X-Request-Id`: Request ID from context

2. **Modifies Headers**:
   - `User-Agent`: Appends " [Modified-By-VTL]" to the original value

3. **Deletes Headers**:
   - `X-Delete-Me`: Any header with this name is filtered out and not passed to the backend

## Project Structure

```
vtl-headers/
├── vtl-lambda/          # Rust Lambda function (echo service)
│   ├── src/
│   │   └── main.rs
│   └── Cargo.toml
└── infra/               # CDK infrastructure
    ├── bin/
    │   └── app.ts
    ├── lib/
    │   └── vtl-headers-stack.ts
    └── package.json
```

## Deployment

```bash
cd vtl-headers/infra
npm install
npm run build
cdk deploy
```

## Testing

Send a request with various headers:

```bash
curl -X POST https://<api-id>.execute-api.us-west-2.amazonaws.com/prod/ \
  -H "Content-Type: application/json" \
  -H "User-Agent: MyClient/1.0" \
  -H "X-Delete-Me: ShouldNotAppear" \
  -H "X-Keep-Me: ShouldAppear" \
  -d '{"test": "data"}'
```

The response will show:
- `User-Agent` modified with " [Modified-By-VTL]" appended
- `X-Custom-Added`, `X-Request-Time`, and `X-Request-Id` added
- `X-Delete-Me` removed
- `X-Keep-Me` preserved
