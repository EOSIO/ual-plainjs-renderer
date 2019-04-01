import { Scatter } from 'ual-scatter'
import { User } from 'universal-authenticator-library'
import { UALJs } from 'ual-plainjs-renderer'
import { JsonRpc } from 'eosjs'
import { MockAuthenticator } from './AuthMocks'
import demoTransaction from './demo-transaction'

// Example environment type definition
interface ExampleEnv {
  CHAIN_ID: string,
  RPC_PROTOCOL: string,
  RPC_HOST: string,
  RPC_PORT: string
}

declare var EXAMPLE_ENV: ExampleEnv

let loggedInUser: User

const exampleNet = {
  chainId: EXAMPLE_ENV.CHAIN_ID,
  rpcEndpoints: [{
    protocol: EXAMPLE_ENV.RPC_PROTOCOL,
    host: EXAMPLE_ENV.RPC_HOST,
    port: Number(EXAMPLE_ENV.RPC_PORT),
  }]
}

let balanceUpdateInterval

const userCallback = async (users: User[]) => {
  loggedInUser = users[0]
  console.info('User Information:')
  console.info('Account Name:', await loggedInUser.getAccountName())
  console.info('Chain Id:', await loggedInUser.getChainId())

  balanceUpdateInterval = setInterval(updateBalance, 1000)

  const transferDiv = document.getElementById('div-transfer')
  transferDiv!.style.display = 'block'
}

const ual = new UALJs(
  userCallback,
  [exampleNet],
  'UAL Test',
  [
    new Scatter([exampleNet], {appName: 'UAL Example'}),
    new MockAuthenticator([exampleNet]),
  ],
  {
    containerElement: document.getElementById('ual-div')
  }
)

ual.init()

addTransferButtonEventListener()

function addTransferButtonEventListener() {
  const transferButton = document.getElementById('btn-transfer')

  transferButton!.addEventListener('click', async () => {
    // Update our demo transaction to use the logged in user
    const userAccountName = await loggedInUser.getAccountName()
    demoTransaction.actions[0].authorization[0].actor = userAccountName
    demoTransaction.actions[0].data.from = userAccountName

    loggedInUser.signTransaction(
      demoTransaction,
      { broadcast: true }
    )
  })
}

addLogoutButtonListener()

function addLogoutButtonListener() {
  const logoutButton = document.getElementById('btn-logout')

  logoutButton!.addEventListener('click', async () => {
    clearInterval(balanceUpdateInterval)

    const transferDiv = document.getElementById('div-transfer')
    transferDiv!.style.display = 'none'

    ual.logoutUser()
  })
}

async function updateBalance() {
  const balanceTag = document.getElementById('p-transfer')

  try {
    const rpc = new JsonRpc(`${EXAMPLE_ENV.RPC_PROTOCOL}://${EXAMPLE_ENV.RPC_HOST}`)
    const accountName = await loggedInUser.getAccountName()
    const data = await rpc.get_account(accountName)

    const { core_liquid_balance: balance } = data
    balanceTag!.innerHTML = `Account Liquid Balance: ${balance}`

  } catch (e) {
    console.error(e)
    balanceTag!.innerHTML = `Unable to retrieve account balance at this time`
  }
}
