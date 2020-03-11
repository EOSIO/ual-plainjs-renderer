import { MessageModal, MessageTypes } from './MessageModal'

describe('Message Modal', () => {
  let modalInstance
  beforeEach(() => {
    modalInstance = new MessageModal()
  })

  it('Displays Message title', () => {
    modalInstance.showMessage({
      title: 'Modal Title',
      message: 'Modal Message Content'
    })

    expect(modalInstance.getComponentElement().innerHTML).toContain('Modal Title')
    expect(modalInstance.getComponentElement().innerHTML).toContain('Modal Message Content')
  })

  describe('Message Colors', () => {
    it('displays error messages in red', () => {
      modalInstance.showMessage({
        title: 'Error Title',
        message: 'Modal Error Content',
        type: MessageTypes.ERROR
      })

      const messageContentDiv = modalInstance.getComponentElement().querySelector('#ual-modal-message')

      expect(messageContentDiv.style.color).toEqual('red')
    })

    it('displays success messages in green', () => {
      modalInstance.showMessage({
        title: 'Success Title',
        message: 'Modal Success Content',
        type: MessageTypes.SUCCESS
      })

      const messageContentDiv = modalInstance.getComponentElement().querySelector('#ual-modal-message')

      expect(messageContentDiv.style.color).toEqual('green')
    })

    it('displays non typed messages in black', () => {
      modalInstance.showMessage({
        title: 'Success Title',
        message: 'Modal Success Content'
      })

      const messageContentDiv = modalInstance.getComponentElement().querySelector('#ual-modal-message')

      expect(messageContentDiv.style.color).toEqual('black')
    })
  })

  it('hides when close is called', () => {
    const closeButton = modalInstance.getComponentElement().querySelector('.ual-modal-close') as HTMLElement
    closeButton.click()

    expect(modalInstance.getComponentElement().style.display).toBe('none')
  })

  describe('callback mapping', () => {
    const onCloseStub = jest.fn()

    beforeEach(() => {
      onCloseStub.mockReset()
      modalInstance = new MessageModal()
      modalInstance.showMessage({
        title: 'Success Title',
        message: 'Modal Success Content',
        onClose: onCloseStub
      })
    })

    it('calls onClose when onClose is called', () => {
      modalInstance.close()
      expect(onCloseStub).toBeCalledTimes(1)
    })

    it('doesn\'t call onClose when the modal is already closed', () => {
      modalInstance.close()
      onCloseStub.mockReset()

      modalInstance.close()
      expect(onCloseStub).not.toBeCalled()
    })
  })
})
