import 'jest-localstorage-mock'
import promisePolyFill from 'promise'
import { Authenticator, User } from 'universal-authenticator-library'
import { UALJs } from './UALJs'

import { AutologinAuthenticator } from './AuthMocks/AutologinAuthenticator'
import { BaseMockAuthenticator } from './AuthMocks/BaseMockAuthenticator'

jest.useFakeTimers()
// jest.useFakeTimers() changes the order in which promises are run
// Issue: https://github.com/facebook/jest/pull/6876
// Workaround: https://github.com/facebook/jest/issues/7151
global.Promise = promisePolyFill

describe('Authenticators', () => {
  let containerElement: HTMLElement
  let ual: UALJs
  let authenticator: Authenticator
  let login
  let isLoading

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

    ual = createNewUALJs(authenticator, containerElement)
  })

  afterEach(() => {
    localStorage.clear()

    document.body.innerHTML = ``
  })

  it('throw error when no autologin authenticators are provided', () => {
    let errorThrown = true

    try {
      ual = new UALJs((users) => { console.info('users', users) }, [], 'my cool app', [])
      ual.init()
      errorThrown = false
    } catch (e) {
      expect(e.message).toBe('Render Configuration is required when no auto login authenticator is provided')
      errorThrown = true
    }

    expect(errorThrown).toBeTruthy()
  })

  describe('login', () => {
    it('calls login with provided authenticator', async () => {
      ual.init()
      await ual.loginUser(authenticator)

      expect(authenticator.login).toBeCalledTimes(1)
    })

    it('does not login if authenticator is still loading', () => {
      authenticator.isLoading = jest.fn().mockReturnValue(true)

      ual = createNewUALJs(authenticator, containerElement)

      ual.init()
      ual.loginUser(authenticator)

      expect(authenticator.isLoading).toHaveBeenCalled()
      expect(authenticator.login).not.toHaveBeenCalled()
    })

    it('eventually logs in once authenticator is no longer loading', async () => {
      authenticator.isLoading = jest.fn().mockReturnValue(true)

      ual = createNewUALJs(authenticator, containerElement)

      ual.init()
      const promise = ual.loginUser(authenticator)
      jest.advanceTimersByTime(250)

      expect(authenticator.isLoading).toHaveBeenCalled()
      expect(authenticator.login).not.toHaveBeenCalled()

      authenticator.isLoading = jest.fn().mockReturnValue(false)

      jest.advanceTimersByTime(250)
      await promise

      expect(authenticator.login).toHaveBeenCalled()
    })

    describe('error is thrown by authenticator', () => {
      const loginError = new Error('Login Error')

      beforeEach(() => {
        authenticator.login = jest.fn().mockImplementation(() => { throw loginError })
      })

      it('throws original caught error', async () => {
        let didThrow = true

        try {
          ual.init()
          await ual.loginUser(authenticator)
          didThrow = false
        } catch (error) {
          expect(error).toEqual(loginError)
        }

        expect(didThrow).toBe(true)
      })

      it('clears session keys', async () => {
        try {
          ual.init()
          await ual.loginUser(authenticator)
        } catch (error) {
          expect(error).toEqual(loginError)
        }

        expect(localStorage.getItem('ual-session-expiration')).toBeNull()
        expect(localStorage.getItem('ual-session-authenticator')).toBeNull()
        expect(localStorage.getItem('ual-session-account-name')).toBeNull()
      })
    })
  })

  describe('logout', () => {
    it('clears session keys', async () => {
      authenticator.shouldRequestAccountName = jest.fn().mockResolvedValue(true)

      ual = createNewUALJs(authenticator, containerElement)

      ual.init()
      await ual.loginUser(authenticator, 'mycoolUser')
      await ual.logoutUser()

      expect(localStorage.getItem('ual-session-expiration')).toBeNull()
      expect(localStorage.getItem('ual-session-authenticator')).toBeNull()
      expect(localStorage.getItem('ual-session-account-name')).toBeNull()
    })

    it('calls logout on the authenticator provided', async () => {
      authenticator = new BaseMockAuthenticator([], null)
      authenticator.logout = jest.fn().mockResolvedValue(true)

      ual = createNewUALJs(authenticator, containerElement)

      ual.init()
      await ual.loginUser(authenticator, 'mycoolUser')
      await ual.logoutUser()

      expect(authenticator.logout).toHaveBeenCalled()
    })
  })

  describe('session login', () => {
    it('does not login automatically when there is not a stored session state', async () => {
      ual.init()
      await runPromises()

      expect(authenticator.login).not.toHaveBeenCalled()
    })

    it('logs in for non account name required', async () => {
      const thirtyDaysFromNow = new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000))

      localStorage.setItem('ual-session-expiration', `${thirtyDaysFromNow.getTime()}`)
      localStorage.setItem('ual-session-authenticator', authenticator.constructor.name)

      ual.init()
      await runPromises()

      expect(authenticator.login).toHaveBeenCalled()
    })

    it('logs in for account name required', async () => {
      authenticator.shouldRequestAccountName = jest.fn().mockResolvedValue(true)

      ual = createNewUALJs(authenticator, containerElement)

      const thirtyDaysFromNow = new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000))
      localStorage.setItem('ual-session-expiration', `${thirtyDaysFromNow.getTime()}`)
      localStorage.setItem('ual-session-authenticator', authenticator.constructor.name)
      localStorage.setItem('ual-session-account-name', 'reqacctname')

      ual.init()
      await runPromises()

      expect(authenticator.login).toHaveBeenCalledWith('reqacctname')
    })

    it('are set on login when account name is not required', async () => {
      ual.init()
      await ual.loginUser(authenticator)

      expect(localStorage.getItem('ual-session-expiration')).not.toBeNull()
      expect(localStorage.getItem('ual-session-authenticator')).toEqual(authenticator.constructor.name)
    })

    it('are set on login when account name is required', async () => {
      authenticator.shouldRequestAccountName = jest.fn().mockResolvedValue(true)

      ual = createNewUALJs(authenticator, containerElement)

      ual.init()
      await ual.loginUser(authenticator, 'mycoolUser')

      expect(localStorage.getItem('ual-session-expiration')).not.toBeNull()
      expect(localStorage.getItem('ual-session-authenticator')).toEqual(authenticator.constructor.name)
      expect(localStorage.getItem('ual-session-account-name')).toEqual('mycoolUser')
    })
  })

  describe('autologin', () => {
    it('logs in when an autologin authenticator is provided', async () => {
      authenticator = new AutologinAuthenticator([], null)
      authenticator.login = login

      ual = createNewUALJs(authenticator, containerElement)

      ual.init()
      await runPromises()

      expect(authenticator.login).toBeCalledTimes(1)
    })

    it('does not log in when an autologin authenticator is not provided', async () => {
      authenticator = new BaseMockAuthenticator([], null)
      authenticator.login = login

      ual = createNewUALJs(authenticator, containerElement)

      ual.init()
      await runPromises()

      expect(authenticator.login).not.toBeCalled()
    })
  })
})

const sleep = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

const runPromises = async () => {
  // jest.useFakeTimers() changes the order in which promises are run
  // Issue: https://github.com/facebook/jest/pull/6876
  // Workaround: https://github.com/facebook/jest/issues/7151
  // the code below along with the global.Promise pollyfill
  // are workarounds to ensure promises are run in their intended order
  Promise.resolve().then(() => jest.advanceTimersByTime(1))
  await sleep(1)
}

const createNewUALJs = (authenticator: Authenticator, containerElement: HTMLElement) => (
  new UALJs(
    () => true,
    [],
    'my cool app',
    [authenticator],
    {
      containerElement
    }
  )
)
