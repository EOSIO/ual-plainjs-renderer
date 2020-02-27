import { BaseMockAuthenticator } from './BaseMockAuthenticator'

export class InvalidateAuthenticator extends BaseMockAuthenticator {
  public shouldInvalidateAfter(): number {
    return 0
  }
}
