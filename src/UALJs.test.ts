import 'jest-localstorage-mock'
import { User, Authenticator } from 'universal-authenticator-library'
import { UALJs } from './UALJs'

import { AutologinAuthenticator } from './AuthMocks/AutologinAuthenticator'
import { BaseMockAuthenticator } from './AuthMocks/BaseMockAuthenticator'

jest.useFakeTimers()

describe('Authenticators', () => {
  let containerElement: HTMLElement
  let authenticator: Authenticator
  let login: jest.Mock
  let isLoading: jest.Mock

  beforeEach(() => {
    localStorage.clear()

    authenticator = new BaseMockAuthenticator([], null)
    login = jest.fn().mockResolvedValue([{}] as User[])
    isLoading = jest.fn().mockReturnValue(false)
    authenticator.login = login
    authenticator.isLoading = isLoading

    document.body.innerHTML = `
      <div id="buttonContainer"></div>
    `

    containerElement = document.getElementById('buttonContainer')!
  })

  afterEach(() => {
    localStorage.clear()

    document.body.innerHTML = ``
  })

  it('throw error when no autologin authenticators are provided', () => {
    let errorThrown = true

    try {
      const ual = new UALJs((users) => { console.info('users', users) }, [], 'my cool app', [])
      ual.init()
      errorThrown = false
    } catch (e) {
      expect(e.message).toBe('Render Configuration is required when no auto login authenticator is provided')
      errorThrown = true
    }

    expect(errorThrown).toBeTruthy()
  })

  describe('login', () => {
    it('calls login with provided authenticator', () => {

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

      expect(authenticator.login).toBeCalledTimes(1)
    })
  })

  describe('logout', () => {
    it('clears session keys', async () => {
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
    let ualInstance: UALJs

    beforeEach(() => {
      authenticator = new BaseMockAuthenticator([], null)
      authenticator.login = login
      authenticator.isLoading = isLoading

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
      expect(authenticator.login).not.toHaveBeenCalled()
    })

    describe(('stored session state'), () => {
      beforeEach(() => {
        const thirtyDaysFromNow = new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000))
  
        localStorage.setItem('ual-session-expiration', `${thirtyDaysFromNow.getTime()}`)
        localStorage.setItem('ual-session-authenticator', authenticator.constructor.name)
      })

      it('does not login if authenticator is still loading', () => {
        authenticator.isLoading = jest.fn().mockReturnValue(true)
        
        ualInstance.init()
        jest.advanceTimersByTime(250)

        expect(authenticator.login).not.toHaveBeenCalled()
      })

      it('eventually logs in once authenticator is no longer loading', () => {
        authenticator.isLoading = jest.fn().mockReturnValue(true)

        ualInstance.init()
        jest.advanceTimersByTime(250)

        expect(authenticator.login).not.toHaveBeenCalled()

        authenticator.isLoading = jest.fn().mockReturnValue(false)
        
        jest.advanceTimersByTime(250)

        expect(authenticator.login).toHaveBeenCalled()
      })
  
      it('logs in for non account name required', () => {
        ualInstance.init()
        jest.advanceTimersByTime(250)

        expect(authenticator.login).toHaveBeenCalled()
      })
  
      it('logs in for account name required', () => {
        authenticator.shouldRequestAccountName = jest.fn().mockResolvedValue(true)

        localStorage.setItem('ual-session-account-name', 'reqacctname')
  
        ualInstance.init()
        jest.advanceTimersByTime(250)

        expect(authenticator.login).toHaveBeenCalledWith('reqacctname')
      })
    })

    it('are set on login when account name is not required', async () => {
      ualInstance.init()
      await ualInstance.loginUser(authenticator)

      expect(localStorage.getItem('ual-session-expiration')).not.toBeNull()
      expect(localStorage.getItem('ual-session-authenticator')).toEqual(authenticator.constructor.name)
    })

    it('are set on login when account name is required', async () => {
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
      authenticator = new AutologinAuthenticator([], null)
      authenticator.login = login

      const ual = new UALJs(
        () => true,
        [],
        'my cool app',
        [authenticator]
      )
      ual.init()

      expect(authenticator.login).toBeCalledTimes(1)
    })

    it('does not log in when an autologin authenticator is not provided', () => {
      authenticator = new BaseMockAuthenticator([], null)
      authenticator.login = login

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

      expect(authenticator.login).not.toBeCalled()
    })
  })
})
