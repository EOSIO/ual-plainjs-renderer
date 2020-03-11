import { BaseMockAuthenticator } from './BaseMockAuthenticator'

export class AutologinAuthenticator extends BaseMockAuthenticator {
  public shouldAutoLogin(): boolean {
    return true
  }
}
