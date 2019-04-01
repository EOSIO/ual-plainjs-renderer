import 'jest-localstorage-mock'
import { User } from 'universal-authenticator-library'
import { UALJs } from './UALJs'

import { AutologinAuthenticator } from './AuthMocks/AutologinAuthenticator'
import { BaseMockAuthenticator } from './AuthMocks/BaseMockAuthenticator'

describe('Authenticators', () => {
  let containerElement
  let authenticatorLoginMock

  beforeEach(() => {
    localStorage.clear()
    authenticatorLoginMock = jest.fn().mockResolvedValue([{}] as User[])

    document.body.innerHTML = `
      <div id="buttonContainer"></div>
    `

    containerElement = document.getElementById('buttonContainer')!
  })

  afterEach(() => {
    localStorage.clear()

    document.body.innerHTML = ``
  })

  it('throw error when no autlogin authenticators are provided', () => {
    let errorThrown = true

    try {
      const ual = new UALJs((users) => { console.info('users', users) }, [], 'my cool app', [])
      ual.init()
      errorThrown = false
    } catch (e) {
      expect(e.message).toBe('Render Configuaration is required when no auto login authenticator is provided')
      errorThrown = true
    }

    expect(errorThrown).toBeTruthy()
  })

  describe('login', () => {
    it('calls login with provided authenticator', () => {
      const authenticator = new BaseMockAuthenticator([], null)
      authenticator.login = authenticatorLoginMock

      const ual = new UALJs(
        () => true,
        [],
        'my cool app',
        [authenticator],
        {
          containerElement
        }
      )
      ual.init()

      ual.loginUser(authenticator)

      expect(authenticatorLoginMock).toBeCalledTimes(1)
    })
  })

  describe('logout', () => {
    it('clears session keys', async () => {
      const authenticator = new BaseMockAuthenticator([], null)
      authenticator.login = authenticatorLoginMock
      authenticator.shouldRequestAccountName = jest.fn().mockResolvedValue(true)
      const ual = new UALJs(
          () => true,
          [],
          'my cool app',
          [authenticator],
        {
          containerElement
        }
      )

      ual.init()
      await ual.loginUser(authenticator, 'mycoolUser')
      await ual.logoutUser()

      expect(localStorage.getItem('ual-session-expiration')).toBeNull()
      expect(localStorage.getItem('ual-session-authenticator')).toBeNull()
      expect(localStorage.getItem('ual-session-account-name')).toBeNull()
    })

    it('calls logout on the authenticator provided', async () => {
      const authenticator = new BaseMockAuthenticator([], null)
      authenticator.logout = jest.fn().mockResolvedValue(true)

      const ual = new UALJs(
          () => true,
          [],
          'my cool app',
          [authenticator],
        {
          containerElement
        }
      )

      ual.init()
      await ual.loginUser(authenticator, 'mycoolUser')
      await ual.logoutUser()

      expect(authenticator.logout).toHaveBeenCalled()
    })
  })

  describe('session login', () => {
    let ualInstance
    let authenticator

    beforeEach(() => {
      authenticator = new BaseMockAuthenticator([], null)
      authenticator.login = authenticatorLoginMock

      ualInstance = new UALJs(
        () => true,
        [],
        'my cool app',
        [authenticator],
        {
          containerElement
        }
      )
    })

    it('does not login automatically when there is not a stored session state', () => {
      ualInstance.init()
      expect(authenticatorLoginMock).not.toHaveBeenCalled()
    })

    it('logs in for non account name required when there is a stored session state', () => {
      const thirtyDaysFromNow = new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000))

      localStorage.setItem('ual-session-expiration', `${thirtyDaysFromNow.getTime()}`)
      localStorage.setItem('ual-session-authenticator', authenticator.constructor.name)

      ualInstance.init()
      expect(authenticatorLoginMock).toHaveBeenCalled()
    })

    it('logs in for account name required when there is a stored session state', () => {
      const thirtyDaysFromNow = new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000))
      authenticator.shouldRequestAccountName = jest.fn().mockResolvedValue(true)

      localStorage.setItem('ual-session-expiration', `${thirtyDaysFromNow.getTime()}`)
      localStorage.setItem('ual-session-authenticator', authenticator.constructor.name)
      localStorage.setItem('ual-session-account-name', 'reqacctname')

      ualInstance.init()
      expect(authenticatorLoginMock).toHaveBeenCalledWith('reqacctname')
    })

    it(`are set on login when account name is not required`, async () => {
      ualInstance.init()
      await ualInstance.loginUser(authenticator)

      expect(localStorage.getItem('ual-session-expiration')).not.toBeNull()
      expect(localStorage.getItem('ual-session-authenticator')).toEqual(authenticator.constructor.name)
    })

    it(`are set on login when account name is required`, async () => {
      authenticator.shouldRequestAccountName = jest.fn().mockResolvedValue(true)
      ualInstance = new UALJs(
          () => true,
          [],
          'my cool app',
          [authenticator],
        {
          containerElement
        }
        )

      ualInstance.init()
      await ualInstance.loginUser(authenticator, 'mycoolUser')

      expect(localStorage.getItem('ual-session-expiration')).not.toBeNull()
      expect(localStorage.getItem('ual-session-authenticator')).toEqual(authenticator.constructor.name)
      expect(localStorage.getItem('ual-session-account-name')).toEqual('mycoolUser')
    })
  })

  describe('autologin', () => {
    it('logs in when an autologin authenticator is provided', () => {
      const authenticator = new AutologinAuthenticator([], null)
      authenticator.login = authenticatorLoginMock

      const ual = new UALJs(
        () => true,
        [],
        'my cool app',
        [authenticator]
      )
      ual.init()

      expect(authenticatorLoginMock).toBeCalledTimes(1)
    })

    it('does not log in when an autologin authenticator is not provided', () => {
      const authenticator = new BaseMockAuthenticator([], null)
      authenticator.login = authenticatorLoginMock

      const ual = new UALJs(
        () => true,
        [],
        'my cool app',
        [authenticator],
        {
          containerElement
        }
      )
      ual.init()

      expect(authenticatorLoginMock).not.toBeCalled()
    })
  })
})
