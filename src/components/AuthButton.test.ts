import { ButtonStyle } from 'universal-authenticator-library'
import { BaseMockAuthenticator } from '../AuthMocks/BaseMockAuthenticator'
import { AuthButton } from './AuthButton'

describe('AuthButton', () => {
  let basicAuthenticator

  beforeEach(() => {
    document.body.innerHTML = ''
    basicAuthenticator = new BaseMockAuthenticator([])
    basicAuthenticator.getStyle = () => {
      return {
        icon: 'racecar.png',
        text: 'Fast Car',
        textColor: 'yellow',
        background: 'red',
      } as ButtonStyle
    }
  })

  describe('basic rendering', () => {
    let authButton

    beforeEach(() => {
      authButton = new AuthButton({ authenticator: basicAuthenticator })
      document.body.appendChild(authButton.getComponentElement())
    })

    it('renders name of authenticator', () => {
      const authText = [...document.getElementsByClassName('ual-auth-text')!][0]
      expect(authText.innerHTML).toEqual('Fast Car')
    })

    it('renders icon of authenticator', () => {
      const authIcon = [...document.getElementsByClassName('ual-auth-icon')!][0]
      expect(authIcon.getAttribute('src')).toEqual('racecar.png')
    })

    it('sets text color of authenticator', () => {
      const authButtonDiv = [...document.getElementsByClassName('ual-auth-text')!][0]
      expect(authButtonDiv.getAttribute('style')).toContain('color: yellow')
    })

    it('sets background color of authenticator', () => {
      const authButtonDiv = [...document.getElementsByClassName('ual-auth-button')!][0]
      expect(authButtonDiv.getAttribute('style')).toContain('background-color: red')
    })

    it('sets status icon of authenticator to chevron with happy base state', () => {
      const statusIconElements = [...document.getElementsByClassName('fa-chevron-right')!]
      expect(statusIconElements.length).toEqual(1)
    })
  })

  it('is rendering download', () => {
    const authButton = new AuthButton({ authenticator: basicAuthenticator, showDownload: true })
    document.body.appendChild(authButton.getComponentElement())

    const statusIconElements = [...document.getElementsByClassName('fa-download')!]
    expect(statusIconElements.length).toEqual(1)
  })

  describe('state renderering', () => {
    describe('is errored', () => {
      let authButton

      beforeEach(() => {
        // put our authenticator into an errored state
        basicAuthenticator.isErrored = jest.fn().mockReturnValue(true)
        basicAuthenticator.getError = jest.fn().mockReturnValue(new Error('An unfortunate event'))

        authButton = new AuthButton({ authenticator: basicAuthenticator })
        document.body.appendChild(authButton.getComponentElement())
      })

      it('shows error icon', () => {
        const statusIconElements = [...document.getElementsByClassName('fa-exclamation-circle')!]
        expect(statusIconElements.length).toEqual(1)
      })

      it('populates error tooltip', () => {
        const authButtonDiv = [...document.getElementsByClassName('ual-auth-button')!][0]
        expect(authButtonDiv.getAttribute('data-tippy-content')).toEqual('An unfortunate event')
      })

      it('styles background to error color', () => {
        const authButtonDiv = [...document.getElementsByClassName('ual-auth-button')!][0]
        expect(authButtonDiv.getAttribute('style')).toContain('background-color: #D5D8E2')
      })

      it('styles text to error color', () => {
        const authButtonDiv = [...document.getElementsByClassName('ual-auth-text')!][0]
        expect(authButtonDiv.getAttribute('style')).toContain('color: #9096A8')
      })
    })

    describe ('is loading', () => {
      let authButton

      beforeEach(() => {
        // put our authenticator into an errored state
        basicAuthenticator.isLoading = jest.fn().mockReturnValue(true)

        authButton = new AuthButton({ authenticator: basicAuthenticator })
        document.body.appendChild(authButton.getComponentElement())
      })

      it('shows loading icon', () => {
        const statusIconElements = [...document.getElementsByClassName('ual-spinner')!]
        expect(statusIconElements.length).toEqual(1)
      })
    })
  })

  it('calls onClick callback when clicked', () => {
    const clickCallbackMock = jest.fn()
    const authButton = new AuthButton({ authenticator: basicAuthenticator, onClick: clickCallbackMock })

    document.body.appendChild(authButton.getComponentElement())

    const component = document.getElementsByClassName('ual-auth-button')![0] as HTMLElement
    component.click()

    expect(clickCallbackMock).toBeCalled()
  })
})
