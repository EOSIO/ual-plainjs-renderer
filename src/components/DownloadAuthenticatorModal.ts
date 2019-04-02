import { Authenticator } from 'universal-authenticator-library'
import { UALJsAbstractBaseComponent } from '../UALJsAbstractBaseComponent'

interface DownloadAuthenticatorModalOptions {
  onGoBack: () => void,
  onClose: () => void
}

export class DownloadAuthenticatorModal extends UALJsAbstractBaseComponent {
  /**
   *
   * @param options { onGoBack, onClose } // goback and close callbacks
   */
  constructor(options: DownloadAuthenticatorModalOptions) {
    super(options)
  }

  public close() {
    // only hide and call close if we aren't already visible
    if (this.dom.style.display !== 'none') {
      this.hide()
      this.options.onClose()
    }
  }

  /**
   * Show the download modal and provide a download button for the provided authenticator
   *
   * @param authenticator Authenticator this modal represents
   */
  public open(authenticator: Authenticator) {
    const { text, textColor, background } = authenticator.getStyle()
    const downloadUri = authenticator.getOnboardingLink()

    const contentDescription = this.dom.querySelector('.ual-modal-content-description') as HTMLElement
    contentDescription.textContent = `Install ${text} to Continue`

    const contentTextBox = this.dom.querySelector('.ual-modal-text-box') as HTMLElement
    contentTextBox.textContent = `To get started with ${text}, install the app at the link below.`

    contentDescription.style.color = textColor

    const getDownloadLink = this.dom.querySelector('.ual-leave-and-install') as HTMLLinkElement
    getDownloadLink.href = downloadUri

    const modalElement = this.dom.querySelector('#ual-modal-get-authenticator') as HTMLElement

    modalElement.style.background = background
    modalElement.style.color = textColor

    this.show()
  }

  public goBack() {
    this.options.onGoBack()
  }

  protected generateStyles(): string {
    return `
      .ual-go-back {
        color: white;
        font-size: 1rem;
        cursor: pointer;
        text-align: center;
      }

      a.ual-leave-and-install {
        width: 260px;
        padding: 11px;
        margin: 4em auto;
        display: block;
        border-radius: 5px;
        font-size: 1em;
        background: rgba(255, 255, 255, 0.2);
        color: inherit;
        text-align: center;
        text-decoration: none;
      }
    `
  }

  /**
   * Generates the Modal DOM, binds go-back, and close handlers
   */
  protected generateDom(): HTMLElement {
    const component =  document.createElement('div')
    component.innerHTML = `
      <div id="ual-modal-get-authenticator">
        <span class="ual-modal-close">&times;</span>
        <p class="ual-modal-content-description"></p>
        <p class="ual-modal-text-box"></p>
        <a class="ual-leave-and-install"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >Leave and Install</a>
        <div class="ual-go-back">Go Back</div>
      </div>`

    component.querySelector('.ual-modal-close')!.addEventListener('click', () => {
      this.close()
    })

    component.querySelector('.ual-go-back')!.addEventListener('click', () => {
      this.options.onGoBack()
    })

    return component
  }
}
