import {
  Authenticator,
  ButtonStyle,
  Chain,
  SignTransactionConfig,
  SignTransactionResponse,
  UALError,
  UALErrorType,
  User
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

export class MockAuthenticator extends Authenticator {
  public loading: boolean = true

  constructor(chains: Chain[]) {
    super(chains)
  }

  public getOnboardingLink() {
    return 'https://localhost'
  }

  public getStyle() {
    return {
      /* tslint:disable */
      icon: '',
      /* tslint:enable */
      textColor: 'white',
      background: 'blue',
      text: 'Mock Auths'
    } as ButtonStyle
  }

  public shouldRender() {
    return true
  }

  public shouldAutoLogin() {
    return false
  }
  public login(accountName?: string) {
    alert('Mock Login Authenticator Triggered')
    console.info('Attempted login with ', accountName)

    // Simulate login delay response
    // return new Promise<[MockUser]>((resolve) => {
    //   setTimeout(() => {
    //     resolve([new MockUser(accountName || '', this.chains)])
    //   }, 4000)
    // })
    // return Promise.reject(new UALError('it broke', UALErrorType.Login, null, 'Mock Authenticator'))

    // Login without a delay response
    return Promise.resolve([new MockUser(accountName || '', this.chains)])
  }

  public shouldRequestAccountName() {
    return Promise.resolve(true)
  }

  public logout() {
    console.info('Logging out')
    return Promise.resolve()
  }

  public async init(): Promise<any> {
    this.loading = false
  }

  public isLoading(): boolean {
    return this.loading
  }

  public isErrored(): boolean {
    return false
  }

  public getError(): UALError | null {
    return new UALError('Initialization Error', UALErrorType.Initialization, null, 'this guy')
  }

  public reset() {
    console.info('resetting mock authenticator')
  }

  public requiresGetKeyConfirmation() {
    return false
  }
}
