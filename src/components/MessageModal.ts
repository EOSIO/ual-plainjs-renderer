import { UALJsAbstractBaseComponent } from '../UALJsAbstractBaseComponent'

export enum MessageTypes {
  ERROR = 1,
  SUCCESS = 2
}

export interface ModalMessage {
  title?: string,
  message: string,
  type?: MessageTypes,
  onClose?: any
}

export class MessageModal extends UALJsAbstractBaseComponent {
  private onClose = () => { return }

  public generateStyles(): string {
    return `
      #ual-modal-message-description {
        color: rgb(20, 35, 93);
        width: 265px;
        font-size: 2em;
        margin: .7em auto
      }

      #ual-modal-message-content {
        font-family: 'Source Sans Pro', sans-serif;
        background-color: #fefefe;
        margin: 10% auto;
        padding: 30px;
        border: 1px solid #888;
        border-radius: 6px;
        width: 370px;
      }

      #ual-modal-message {
        margin: .7em auto;
        width: 260px;
      }

      @media only screen and (max-width: 480px) {
        #ual-modal-message-content {
          width: calc(100% - 30px);
          border: 0px;
          border-radius: 0px;
          padding: 15px;
          height: calc(100% - 30px);
          margin: 0px;
        }
      }
    `
  }

  /**
   * Generates the Modal DOM and binds close handler
   */
  protected generateDom(): HTMLElement {
    const component = document.createElement('div')
    component.innerHTML = `
      <div id="ual-modal-message-content">
        <span class="ual-modal-close">&times;</span>
        <p id="ual-modal-message-description"></p>
        <p>
          <div id="ual-modal-message"></div>
        </p>
      </div>
    `

    component.querySelector('.ual-modal-close')!.addEventListener('click', () => {
      this.close()
    })

    return component
  }

  /**
   * Sets the message content of the modal
   *
   * @param modalMessage ModalMessage
   */
  public setMessage(modalMessage: ModalMessage) {
    const { title = '', message, type = null } = modalMessage

    const modalMessageDescription = this.dom.querySelector('#ual-modal-message-description')
    const modalMessageContent = this.dom.querySelector('#ual-modal-message') as HTMLDivElement

    modalMessageDescription!.innerHTML = title
    modalMessageContent!.innerHTML = message

    switch (type) {
      case MessageTypes.ERROR:
        modalMessageContent!.style.color = 'red'
        break
      case MessageTypes.SUCCESS:
        modalMessageContent!.style.color = 'green'
        break
      default:
        modalMessageContent!.style.color = 'black'
    }
  }

  /**
   * Sets the message for the modal and also shows it
   *
   * @param modalMessage ModalMessage
   */
  public showMessage(modalMessage: ModalMessage) {
    this.setMessage(modalMessage)
    this.show()

    if (modalMessage.onClose) {
      this.onClose = modalMessage.onClose
    }
  }

  public close() {
    // only hide and call close if we aren't already visible
    if (this.dom.style.display !== 'none') {
      this.hide()
      this.onClose()

      this.onClose = () => { return }
    }
  }
}
