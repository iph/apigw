
## Building the Project

This project is a simple architecture:
```
    http-api------+
                  |
                  +---rust-lambda
                  |
    rest-api------+
```

The Rust lambda just echoes the headers and the body into a json payload -- non base64 encoded. It echoes using a pure string
since Hyper libraries are known to lowercase -- which is not what is wanted. 

The Rust lambda is prepackaged in echo.zip, which cdk links to directly. If you want to add or modify, then follow the `re-building the lambda` otherwise follow `build infrastructure`

### Re-building the lambda
```
cd echo
cd echo-lambda
cargo lambda build --arm64 --release
cd ..
cp ../target/lambda/echo-lambda/bootstrap .
zip echo.zip bootstrap
rm bootstrap
```

### Build Infrastructure

```
cd echo
cd infra
```
Source your credentials then run:
```
cdk deploy
```
