import { BaseMockAuthenticator } from '../AuthMocks/BaseMockAuthenticator'
import { AccountInputModal } from './AccountInputModal'

describe('Account Input Modal', () => {
  let component
  const onGoBackMock = jest.fn()
  const onCloseMock = jest.fn()
  const loginMock = jest.fn()

  beforeEach(() => {
    onGoBackMock.mockReset()
    onCloseMock.mockReset()
    loginMock.mockReset()

    component = new AccountInputModal({
      onGoBack: onGoBackMock,
      onClose: onCloseMock
    })

    document.body.innerHTML = ''

    let parentContainer
    parentContainer = document.createElement('div')
    document.body.appendChild(parentContainer)

    component.attach(parentContainer)
  })

  describe('auth button', () => {
    let authButton
    let accountInput
    beforeEach(() => {
      component.showInput(new BaseMockAuthenticator([]), loginMock)
      authButton = component.getComponentElement().querySelector('.ual-auth-button')! as HTMLElement
      accountInput = component.getComponentElement().querySelector('#ual-account-input')!
    })

    it('calls login with valid input', () => {
      accountInput.value = 'validinputworks'

      authButton.click()
      expect(loginMock).toBeCalled()
    })

    it('does not call login with invalid input', () => {
      accountInput.value = ''

      authButton.click()
      expect(loginMock).not.toBeCalled()
    })

    it('displays error when clicked and input is invalid', () => {
      accountInput.valid = ''
      authButton.click()

      const errorMessage = component.getComponentElement().querySelector('#ual-account-input-error')!

      expect(errorMessage.innerHTML).toEqual('Account Name is required')
    })

    it('cleans up validation error when clicked after fixing invalid data', () => {
      // start with invalid
      accountInput.value = ''
      authButton.click()

      // change to valid
      accountInput.value = 'somethingvalid'
      authButton.click()

      const errorMessage = component.getComponentElement().querySelector('#ual-account-input-error')!
      expect(errorMessage.innerHTML).toEqual('')
    })
  })

  describe('whens shown', () => {
    it('renders auth button', () => {
      const buttonContainer = component.getComponentElement().querySelector('#ual-input-continue-button-container')!
      component.showInput(new BaseMockAuthenticator([]))
      expect(buttonContainer.children.length).toEqual(1)
    })
  })

  describe('when closed', () => {
    let closeButton
    beforeEach(() => {
      closeButton = component.getComponentElement().querySelector('.ual-modal-close')! as HTMLElement
    })

    it('resets input field', () => {
      const accountInput = component.getComponentElement().querySelector('#ual-account-input')!
      accountInput.value = 'weeee'

      closeButton.click()

      expect(accountInput.value).toEqual('')
    })

    it('calls close callback', () => {
      closeButton.click()

      expect(onCloseMock).toBeCalled()
    })

    it('hides', () => {
      closeButton.click()

      expect(component.getComponentElement().style.display).toEqual('none')
    })
  })

  describe('when Go Back is clicked', () => {
    it('calls onGoBack', () => {
      const goBackButton = component.getComponentElement().querySelector('.ual-go-back') as HTMLElement
      goBackButton.click()

      expect(onGoBackMock).toBeCalled()
    })
  })

  it('only renders one button even if opened multiple times', () => {
    component.showInput(new BaseMockAuthenticator([]), loginMock)
    component.showInput(new BaseMockAuthenticator([]), loginMock)
    const buttonContainer = component.getComponentElement().querySelector('#ual-input-continue-button-container')!

    expect(buttonContainer.children.length).toEqual(1)
  })

})
