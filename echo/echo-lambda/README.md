
## Building the Project

To build the project, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory: `cd /workspaces/apigw/echo/echo-lambda`.
3. run `cargo lambda build --arm64 --release`
3. run `zip echo.zip ../target/lambda/echo-lambda/bootstrap`
4. Build the project: `npm run build`.

Once the build process is complete, you can proceed with deploying the project or running it locally.
