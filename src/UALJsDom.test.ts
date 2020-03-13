import 'jest-localstorage-mock'
import { Authenticator, User } from 'universal-authenticator-library'
import { UALJsDom } from './UALJsDom'

import { BaseMockAuthenticator } from './AuthMocks/BaseMockAuthenticator'

describe('Authenticators', () => {
  let baseAuthenticator
  let authenticatorLoginMock
  let containerElement

  beforeEach(() => {
    authenticatorLoginMock = jest.fn().mockResolvedValue([{}] as User[])

    baseAuthenticator = new BaseMockAuthenticator([], null)
    baseAuthenticator.login = authenticatorLoginMock

    document.body.innerHTML = `
      <div id="buttonContainer"></div>
    `

    containerElement = document.getElementById('buttonContainer')!
  })

  afterEach(() => {
    localStorage.clear()

    document.body.innerHTML = ''
  })

  it('renders inside the buttonContainer', () => {
    const mockLoginUserCallback = (authenticator: Authenticator, accountName: string | undefined) => {
      console.info(authenticator, accountName)
    }

    const ualDom = new UALJsDom(
      mockLoginUserCallback,
      [baseAuthenticator],
      containerElement,
      false
    )

    ualDom.generateUIDom()

    expect(document.getElementById('buttonContainer')!.childNodes.length).toBeGreaterThan(0)
  })
})
