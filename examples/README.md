# UAL PlainJS Example App

This example demonstrates an implementation of the [Universal Authenticator Library JS Renderer](https://github.com/EOSIO/universal-authenticator-library-plain-js-renderer) in a simple EOS transfer DAPP.  It uses the [UAL Scatter Authenticator](https://github.com/EOSIO/ual-scatter).

## Setup
```bash
yarn
cp default.env .env
```

The example application uses an environment configuration for the chain and rpc endpoints.  Update the values in the ``.env`` file you created in the first step to point the application at your preferred chain and run the example.

## Environment Defaults
The ``.env`` file that is generated from the first step has the following defaults:
```
CHAIN_ID=12345
RPC_PROTOCOL=https
RPC_HOST=api.example.net
RPC_PORT=443
```

## Run the example
```bash
yarn example
```

Navigate to http://localhost:3000 to see the example application