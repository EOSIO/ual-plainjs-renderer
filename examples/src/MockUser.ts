import {
  Chain,
  SignTransactionConfig,
  SignTransactionResponse,
  UALError,
  UALErrorType,
  User,
} from 'universal-authenticator-library'

const signatureResponse = {
  wasBroadcast: true,
  transactionId: 'Mock transaction Id'
} as SignTransactionResponse

export class MockUser extends User {
  private accountName: string = ''
  private chains: Chain[] = []

  public constructor(accountName: string, chains: Chain[]) {
    super()
    this.accountName = accountName
    this.chains = chains
  }

  public getKeys() {
    return Promise.resolve([])
  }

  public signTransaction(transaction: any, config?: SignTransactionConfig) {
    console.info('Requested signature config', config)
    console.info('Requested signature for', transaction)
    return Promise.resolve(signatureResponse)
  }

  public getAccountName() {
    return Promise.resolve(this.accountName)
  }

  public getChainId() {
    return Promise.resolve(this.chains[0].chainId)
  }

  public signArbitrary(publicKey: string, data: string, helpText: string): Promise<string> {
    return new Promise((resolve, reject) => {
      reject(new UALError('Not implemented', UALErrorType.Signing, null, 'Mock User'))
    })
  }

  public verifyKeyOwnership(_: string): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(true)
    })
  }
}
