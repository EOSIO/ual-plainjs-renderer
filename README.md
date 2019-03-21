# UAL PlainJS Renderer

This library providers a Plain JS renderer around the [Universal Authenticator Library](https://github.com/EOSIO/universal-authenticator-library/). 

It uses nothing but standard Javascript and should be supported across desktop and mobile.

## Getting Started
#### With ``yarn``
```bash
yarn add @blockone/ual-plainjs-renderer
```
Then, install the authenticators that you wish to use...
```bash
yarn add @blockone/ual-scatter @blockone/ual-lynx
```
#### With ``npm``
```bash
npm i @blockone/ual-plainjs-renderer
```
Then, install the authenticators that you wish to use...
```bash
npm i @blockone/ual-scatter @blockone/ual-lynx
```


## Basic Usage
The below code will render a button to the DOM that will launch the Universal Authenticator Library modal.
```javascript
import { UALJs } from '@blockone/ual-plainjs-renderer'
import { Scatter } from '@blockone/ual-scatter'
import { Lynx } from '@blockone/ual-lynx'

const myCallback = arrayOfUsers => {
  // Execute on successful user authentication
}

const myChain = {
  chainId: MY_CHAIN_ID,
  rpcEndpoints: [{
    protocol: MY_CHAIN_PROTOCOL,
    host: MY_CHAIN_HOST,
    port: MY_CHAIN_PORT,
  }]
}

const myAppName = 'My UAL App'

const scatter = new Scatter([myChain], { appName: myAppName })
const lynx = new Lynx([myChain], { appName: myAppName })

const myAppRoot = {
  containerElement: document.getElementById('my-ual-app')
}

const ual = new UALJs(myCallback, [myChain], myAppName, [scatter, lynx], myAppRoot)

ual.init()
```

## Example
An example on how to use the library is provided in the [examples](https://github.com/EOSIO/universal-authenticator-library/tree/develop/examples) folder.

## Environment Set Up
**A one-time environment setup is required prior to development.**  The following commands provides a quick starting point.  Make sure you are in the ``examples/`` directory.
```bash
cd examples
cp default.env .env
```
Now that you have a ``.env`` file, you can set your chain particulars.  Note that this file will not be version-controlled, nor should it be.
The default settings for the file are...
```
CHAIN_ID=12345
RPC_PROTOCOL=https
RPC_HOST=api.example.net
RPC_PORT=443
```
These values can be edited according to the particulars of your project.  They will be used as the chain data in the example app.
*See the [js example](https://github.com/EOSIO/universal-authenticator-library/tree/develop/examples) for more details.*

## Development
After you set up your environment you can begin development.  Make sure you are back in the ``/`` directory of the ``ual-plainjs-renderer`` package.
```bash
yarn
yarn link
yarn build -w
```

In a duplicate terminal tab, enter the following commands:
```bash
cd examples
yarn link @blockone/ual-plainjs-renderer
yarn
yarn example
```

Open a browser at `localhost:3000` to see a running instance of the example.

*It is recommended to have at least two terminal tabs running so that `yarn build -w` and `yarn example` can run simultaneously creating an environment where changes are immediately reflected in the browser.*

## Contributing

[Contributing Guide](https://github.com/EOSIO/universal-authenticator-library/blob/develop/CONTRIBUTING.md)

[Code of Conduct](https://github.com/EOSIO/universal-authenticator-library/blob/develop/CONTRIBUTING.md#conduct)

## License

[MIT](https://github.com/EOSIO/universal-authenticator-library/blob/develop/LICENSE)

Copyright (c) 2017-2019 block.one all rights reserved.

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
