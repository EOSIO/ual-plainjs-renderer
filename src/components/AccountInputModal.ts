import { Authenticator } from '@blockone/universal-authenticator-library'
import { UALJsAbstractBaseComponent } from '../UALJsAbstractBaseComponent'
import { AuthButton } from './AuthButton'

export interface AccountInputModalOptions {
  onGoBack: () => void
  onClose: () => void
}

/**
 * @param options { onGoBack, onClose } // goback and close callbacks
 */
export class AccountInputModal extends UALJsAbstractBaseComponent {
  constructor(options: AccountInputModalOptions) {
    super(options)
  }

  protected generateStyles(): string {
    return `
      @media only screen and (max-width: 480px) {
        #ual-modal-input-content {
          width: calc(100% - 30px);
          border: 0px;
          border-radius: 0px;
          padding: 15px;
          height: calc(100% - 30px);
          margin: 0px;
        }

        #ual-account-input {
          width: calc(100% - 15px) !important;
        }
      }

      #ual-account-input {
        border-radius: 6px;
        height: 2em;
        font-size: 1em;
        padding: 5px;
        width: 250px;
        display: block;
        margin: .7em auto;
      }

      #ual-account-input-error {
        color: red;
        font-weight: bold;
        margin-top: 10px;
        display: none;
      }

      .ual-go-back {
        font-size: 1rem;
        color: rgb(72, 151, 248);
        cursor: pointer;
        width: 260px;
        margin: .7em auto;
      }
    `
  }

  /**
   * Generates the Modal DOM, binds go-back, and close handlers
   */
  protected generateDom(): HTMLElement {

    const accountInputModal = document.createElement('div')
    accountInputModal.id = 'ual-modal-input-content'
    accountInputModal.innerHTML = `
      <span class="ual-modal-close">&times;</span>
      <p class="ual-modal-content-description">
        Next, please enter your Account Name
      </p>
      <input
        id="ual-account-input"
        type="text"
        placeholder="Account Name"
        autocapitalize="none"
      />
      <div id="ual-account-input-error"></div>
      <div id="ual-input-continue-button-container"></div>
      <div class="ual-go-back">&lt;&lt; Go Back</div>
    `

    accountInputModal.querySelector('.ual-modal-close')!.addEventListener('click', () => {
      this.getInputField().value = ''
      this.hide()
      this.options.onClose()
    })

    accountInputModal.querySelector(`.ual-go-back`)!.addEventListener('click', this.options.onGoBack)

    return accountInputModal
  }

  /**
   * Sets and displays account input error
   *
   * @param inputError Error message to show
   */
  private showAccountNameInputError(inputError: string): void {
    const accountInputError = this.dom.querySelector(`#ual-account-input-error`) as HTMLElement
    accountInputError!.innerHTML = inputError
    accountInputError!.style.display = 'block'
  }

  /**
   * Clears account input error and hides it
   */
  private clearAccountNameInputError(): void {
    const accountInputError = this.dom.querySelector(`#ual-account-input-error`) as HTMLElement
    accountInputError!.innerHTML = ''
    accountInputError!.style.display = 'none'
  }

  private getInputField(): HTMLInputElement {
    return (this.dom.querySelector('#ual-account-input') as HTMLInputElement)!
  }

  /**
   * Displays the input modal and ties it to the authenticator requesting
   * username.  Then calls login callback to complete login when clicked.
   *
   * @param authenticator Authenticator you wiish to login with
   * @param login login callback passed from UAL
   */
  public showInput(authenticator: Authenticator, login: any) {
    const inputButtonContainer = this.dom.querySelector('#ual-input-continue-button-container')!

    // cleanup the button since we re-create it on render
    // variation of this answer here for fast child removal
    // https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript#answer-15771070
    let last = inputButtonContainer.lastChild
    while (last != null) {
      inputButtonContainer!.removeChild(last)
      last = inputButtonContainer!.lastChild
    }

    let inputField = this.getInputField()
    // replace the account input so we can clear our authenticator specific listeners
    inputField.parentNode!.replaceChild(
      inputField.cloneNode(true), inputField
    )

    // move our assignment to the clean input field
    inputField = this.getInputField()

    const onClick = () => {
      if (inputField.value.trim() === '') {
        this.showAccountNameInputError('Account Name is required')
        return
      }

      this.clearAccountNameInputError()
      login(authenticator, inputField.value)
    }

    inputButtonContainer.appendChild(
      new AuthButton({authenticator, onClick: onClick.bind(this)}).getComponentElement()
    )

    const accountEnterHandler = (e) => {
      const key = e.which || e.keyCode

      if (key === 13) {
        (inputButtonContainer.children[0] as HTMLElement).click()
      }
    }

    inputField.addEventListener('keypress', accountEnterHandler)

    this.show()
  }
}
