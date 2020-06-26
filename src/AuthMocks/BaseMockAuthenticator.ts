import { Authenticator, ButtonStyle, User } from 'universal-authenticator-library'

export class BaseMockAuthenticator extends Authenticator {
  public init(): Promise<void> {
    return Promise.resolve()
  }
  public login() {
    return Promise.resolve([{}] as User[])
  }
  public getStyle() {
    return {
      text: 'Base Mock',
      textColor: 'black',
      background: 'background-color: green'
    } as ButtonStyle
  }
  public getError() {
    return null
  }
  public getOnboardingLink() {
    return 'http://localhost'
  }
  public isErrored(): boolean {
    return false
  }
  public isLoading(): boolean {
    return false
  }
  public reset() {
    console.info('reset base mock authenticator')
  }
  public shouldRender(): boolean {
    return true
  }
  public shouldAutoLogin(): boolean {
    return false
  }
  public shouldRequestAccountName(): Promise<boolean> {
    return Promise.resolve(false)
  }
  public logout(): Promise<void> {
    return Promise.resolve()
  }
  public requiresGetKeyConfirmation(): boolean {
    return false
  }
  public getName(): string {
    return 'authenticator'
  }
}
