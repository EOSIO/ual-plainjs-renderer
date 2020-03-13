import { BaseMockAuthenticator } from '../AuthMocks/BaseMockAuthenticator'
import { GetAuthenticatorModal } from './GetAuthenticatorModal'

describe('Get Authenticator View', () => {
  let parentContainer
  let component
  let options
  const onDownloadStub = jest.fn()
  const onCloseStub = jest.fn()
  const onResetAuthenticatorsStub = jest.fn()

  beforeEach(() => {
    const baseAuthenticator = new BaseMockAuthenticator([])
    onDownloadStub.mockReset()
    onCloseStub.mockReset()

    document.body.innerHTML = ''
    parentContainer = document.createElement('div')
    document.body.appendChild(parentContainer)
    options = {
      authenticators: [baseAuthenticator],
      onClose: onCloseStub,
      onDownloadClick: onDownloadStub,
      onResetAuthenticatorsClick: onResetAuthenticatorsStub
    }

    component = new GetAuthenticatorModal(options)
    component.attach(parentContainer)
  })

  it('Has Title Text', () => {
    expect(component.getComponentElement().innerHTML).toContain('Pardon the interruption')
  })

  it('hides when close is called', () => {
    component.getComponentElement().style.display = 'block'

    component.close()
    expect(component.getComponentElement().style.display).toBe('none')
  })

  it('calls onClose when onClose is called', () => {
    component.close()
    expect(onCloseStub).toBeCalled()
  })

  it('doesn\'t call onClose when the modal is already closed', () => {
    component.close()
    onCloseStub.mockReset()

    component.close()
    expect(onCloseStub).not.toBeCalled()
  })

  it('shows when open is called', () => {
    component.getComponentElement().style.display = 'none'

    component.open()
    expect(component.getComponentElement().style.display).toBe('block')
  })

  it('Renders button for auth download', () => {
    const renderedAuthButtons = document.getElementsByClassName('ual-auth-button')

    expect(renderedAuthButtons.length).toEqual(1)
  })

  it('Has Descriptor Text', () => {
    expect(component.getComponentElement().innerHTML).toContain(
      // tslint:disable-next-line:max-line-length
      'Install one of our supported authenticators or ensure your authenticator is running and click <a class="ual-reset-link" href="#">here</a> to retry.'
    )
  })

  it('calls close callback close is clicked', () => {
    component.close = jest.fn()

    const closeButton = component.getComponentElement().querySelector('.ual-modal-close') as HTMLElement
    closeButton.click()

    expect(component.close).toBeCalled()
  })

  it('calls reset callback when here link is clicked for reset', () => {
    const resetLink = component.getComponentElement().querySelector('.ual-reset-link') as HTMLLinkElement
    resetLink.click()

    expect(onResetAuthenticatorsStub).toBeCalled()
  })
})
