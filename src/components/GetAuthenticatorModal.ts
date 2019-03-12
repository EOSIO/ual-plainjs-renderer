import { Authenticator } from '@blockone/universal-authenticator-library'
import { UALJsAbstractBaseComponent } from '../UALJsAbstractBaseComponent'
import { AuthButton } from './AuthButton'

interface GetAuthenticatorModalOptions {
  authenticators: Authenticator[] // Authenticators to provide download buttons for
  onClose: () => void // Close callback handler
  onDownloadClick: (authenticator: Authenticator) => void // Download callback handler
  onResetAuthenticatorsClick: () => void // Reset Authenticators callback handler
}

export class GetAuthenticatorModal extends UALJsAbstractBaseComponent {
  /**
   *
   * @param getAuthenticatorModalOptions { authenticators, onClose, onDownloadClick, onResetAuthenticatorsClick }
   */
  constructor(getAuthenticatorModalOptions: GetAuthenticatorModalOptions) {
    super(getAuthenticatorModalOptions)
  }

  protected generateStyles(): string {
    return ''
  }

  private onDownloadClick(authenticator: Authenticator): void {
    this.options.onDownloadClick(authenticator)
  }

  public close() {
    // only hide and call close if we aren't already visible
    if (this.dom.style.display !== 'none') {
      this.hide()
      this.options.onClose()
    }
  }

  public open() {
    this.show()
  }

  /**
   * Generates the Modal DOM, binds go-back, and close handlers, creates and renders Download Authenticator buttons
   */
  protected generateDom(): HTMLElement {
    const { authenticators } = this.options

    const component =  document.createElement('div')
    component.innerHTML = `
      <div id="ual-modal-get-authenticator">
        <span class="ual-modal-close">&times;</span>
        <p class="ual-modal-content-description">
          Pardon the interruption
        </p>
        <p class="ual-modal-text-box">` +
          // tslint:disable-next-line:max-line-length
          `Install one of our supported authenticators or ensure your authenticator is running and click <a class="ual-reset-link" href="#">here</a> to retry.` +
        `</p>
        <div id="ual-authenticators-download-list">
        </div>
      </div>
    `

    // bind close
    component.querySelector('.ual-modal-close')!.addEventListener('click', () => {
      this.close()
    })

    // bind reset
    component.querySelector('.ual-reset-link')!.addEventListener('click', () => {
      this.options.onResetAuthenticatorsClick()
    })

    const downloadList = component.querySelector('#ual-authenticators-download-list')

    authenticators.forEach(
      (authenticator) => {
        const onClick = () => {
          this.onDownloadClick(authenticator)
        }

        downloadList!.append(new AuthButton({authenticator, showDownload: true, onClick }).getComponentElement())
      }
    )

    return component
  }
}
