import { ButtonStyle } from 'universal-authenticator-library'
import { BaseMockAuthenticator } from '../AuthMocks/BaseMockAuthenticator'
import { DownloadAuthenticatorModal } from './DownloadAuthenticatorModal'

describe('Download Authenticator Modal', () => {
  let parentContainer
  let component
  let options
  let baseAuthenticator

  const onCloseStub = jest.fn()
  const onGoBackStub = jest.fn()

  beforeEach(() => {
    baseAuthenticator = new BaseMockAuthenticator([])
    baseAuthenticator.getStyle = () => {
      return {
        icon: 'racecar.png',
        text: 'Fast Car',
        textColor: 'yellow',
        background: 'red',
      } as ButtonStyle
    }

    onGoBackStub.mockReset()
    onCloseStub.mockReset()

    document.body.innerHTML = ''
    parentContainer = document.createElement('div')
    document.body.appendChild(parentContainer)
    options = {
      authenticators: [baseAuthenticator],
      onClose: onCloseStub,
      onGoBack: onGoBackStub
    }

    component = new DownloadAuthenticatorModal(options)
    component.attach(parentContainer)
  })

  describe('authenticator specific text', () => {
    it('Has Empty Title Text when rendered', () => {
      expect(component.getComponentElement().innerHTML).toContain(`<p class="ual-modal-content-description"></p>`)
    })

    it('Has Button Title Text when opened with authenticator', () => {
      component.open(baseAuthenticator)
      expect(component.getComponentElement().querySelector('.ual-modal-content-description').textContent).toEqual(
        `Install Fast Car to Continue`
      )
    })

    it('has empty text-box text when rendered', () => {
      expect(component.getComponentElement().innerHTML).toContain(`<p class="ual-modal-text-box"></p>`)
    })

    it('has Button Title text-box text when rendered', () => {
      component.open(baseAuthenticator)
      expect(component.getComponentElement().querySelector('.ual-modal-text-box').textContent).toEqual(
        `To get started with Fast Car, install the app at the link below.`
      )
    })
  })

  describe('authenticator specific ui', () => {
    it('colors the background', () => {
      component.open(baseAuthenticator)
      const htmlElement = component.getComponentElement().querySelector('#ual-modal-get-authenticator') as HTMLElement
      expect(htmlElement.style.background).toEqual('red')
    })

    it('colors the text', () => {
      component.open(baseAuthenticator)
      const htmlElement = component.getComponentElement().querySelector('#ual-modal-get-authenticator') as HTMLElement
      expect(htmlElement.style.color).toEqual('yellow')
      expect((htmlElement.querySelector('.ual-modal-content-description') as HTMLElement).style.color).toEqual('yellow')
    })

    it('sets href to the download link of the authenticator', () => {
      baseAuthenticator.getOnboardingLink = () => {
        return 'http://fast-car.io/get-fast-car'
      }

      component.open(baseAuthenticator)
      const htmlElement = component.getComponentElement().querySelector('.ual-leave-and-install') as HTMLElement
      expect(htmlElement.getAttribute('href')).toEqual('http://fast-car.io/get-fast-car')
    })
  })

  it('hides when close is called', () => {
    component.getComponentElement().style.display = 'block'

    component.close()
    expect(component.getComponentElement().style.display).toBe('none')
  })

  describe('callback mapping', () => {
    it('calls onClose when onClose is called', () => {
      component.close()
      expect(onCloseStub).toBeCalled()
    })

    it('calls onGoBack when goBack is called', () => {
      component.goBack()
      expect(onGoBackStub).toBeCalled()
    })

    it(`doesn't call onClose when the modal is already closed`, () => {
      component.close()
      onCloseStub.mockReset()

      component.close()
      expect(onCloseStub).not.toBeCalled()
    })

    it('shows when open is called', () => {
      component.getComponentElement().style.display = 'none'

      component.open(baseAuthenticator)
      expect(component.getComponentElement().style.display).toBe('block')
    })
  })

  it('calls close callback close is clicked', () => {
    component.close = jest.fn()

    const closeButton = component.getComponentElement().querySelector('.ual-modal-close') as HTMLElement
    closeButton.click()

    expect(component.close).toBeCalled()
  })

  it('calls onGoBack when onGoBack is clicked', () => {
    const goBackButton = component.getComponentElement().querySelector('.ual-go-back') as HTMLElement
    goBackButton.click()

    expect(onGoBackStub).toBeCalled()
  })
})
