import { Authenticator, UALError, UALErrorType } from 'universal-authenticator-library'
import { AccountInputModal } from './components/AccountInputModal'
import { AuthButton } from './components/AuthButton'
import { DownloadAuthenticatorModal } from './components/DownloadAuthenticatorModal'
import { GetAuthenticatorModal } from './components/GetAuthenticatorModal'
import { MessageModal, MessageTypes, ModalMessage } from './components/MessageModal'

declare global {
  interface Window {
    tippy: (e: any, t: any, r: any | null) => void
  }
}

type UserLoginCallback = (authenticator: Authenticator, accountName: string | undefined) => void

/**
 * UnisonDom responsible for creating the UI elements of the Authenticator
 */
export class UALJsDom {
  private loginCallback: UserLoginCallback
  private containerElement: HTMLElement
  private buttonStyleOverride: string | boolean
  private authenticators: Authenticator[]
  private authStateString: string = ''

  private getAuthenticatorsView: GetAuthenticatorModal | null = null
  private authenticatorModal: HTMLElement | null = null
  private downloadAuthenticatorView: DownloadAuthenticatorModal | null = null
  private messageModalView: MessageModal | null = null
  private accountInputModalView: AccountInputModal | null = null

  /**
   * UnisonDom responsible for creating the UI elements of the Authenticator
   *
   * @param Authenticator[] Array of authenticators to show the user
   * @param HTMLElement Container element for all Authenticator UI elements
   * @param buttonStyleOverride Allows the user to override the default styles of the auth start button
   * @stylePrefix Allows the user to override the prefix of class and id elements to avoid style conflicts
   */
  constructor(
    loginCallback: UserLoginCallback,
    authenticators: Authenticator[],
    containerElement: HTMLElement,
    buttonStyleOverride: string | boolean = false,
  ) {
    this.loginCallback = loginCallback
    this.authenticators = authenticators
    this.containerElement = containerElement
    this.buttonStyleOverride = buttonStyleOverride
  }

  /**
   * Generates and appends the UI to the dom; this is user called because the container
   * element may not be available at initialization
   */
  public generateUIDom() {
    const faStylesheet = document.createElement('link') as HTMLLinkElement
    faStylesheet.rel = 'stylesheet'
    faStylesheet.href = 'https://use.fontawesome.com/releases/v5.6.3/css/all.css'
    faStylesheet.integrity = 'sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/'
    faStylesheet.crossOrigin = 'anonymous'

    this.containerElement.appendChild(faStylesheet as HTMLElement)

    const tippyJs = document.createElement('script') as HTMLScriptElement
    tippyJs.src = 'https://unpkg.com/tippy.js@3.4.1/dist/tippy.all.min.js'

    this.containerElement.appendChild(tippyJs)

    const tippyStylesheet = document.createElement('link') as HTMLLinkElement
    tippyStylesheet.rel = 'stylesheet'
    tippyStylesheet.href = 'https://unpkg.com/tippy.js@3.4.1/dist/tippy.css'

    this.containerElement.appendChild(tippyStylesheet as HTMLElement)

    const lightTippyStylesheet = document.createElement('link') as HTMLLinkElement
    lightTippyStylesheet.rel = 'stylesheet'
    lightTippyStylesheet.href = 'https://unpkg.com/tippy.js@3.4.1/dist/themes/light.css'

    this.containerElement.appendChild(lightTippyStylesheet as HTMLElement)

    const button = this.createButton()
    const buttonStyles = this.createButtonStyles(this.buttonStyleOverride)

    this.containerElement.appendChild(buttonStyles)
    this.containerElement.appendChild(button)

    this.attachLoginButtonWatcher()

    const authenticationModalStyles = this.createAuthenticatorModalStyles()
    this.authenticatorModal = this.createAuthenticatorModal()

    this.containerElement.appendChild(authenticationModalStyles)
    this.containerElement.appendChild(this.authenticatorModal)

    // bind any tooltips on buttons, tippy loads asychronously and may not be initially available
    let interval
    interval = setInterval(() => {
      if (!!window.tippy) {
        window.tippy(this.containerElement, {
          target: '.tippy-binding',
          theme: 'light',
          arrow: 'true',
          size: 'large'
        }, null)
        clearInterval(interval)
      }
    }, 50)

    // starts a cyclical redraw of the authenticator buttons
    // so if state change occurs they redraw
    this.startRefreshAuthenticatorsTimeout()

    if (this.buttonStyleOverride) {
      const styleStr = typeof this.buttonStyleOverride === 'boolean' ? '' : this.buttonStyleOverride.toString()
      this.containerElement.appendChild(this.createButtonStyles(styleStr))
    }
  }

  /**
   * Does a cyclical redraw of the authenticators so we can redraw on state change
   */
  private startRefreshAuthenticatorsTimeout() {
    // update our comparison state string
    if (this.getAuthenticatorsStateString() !== this.authStateString) {
      this.drawAuthenticatorsButtons()
      this.authStateString = this.getAuthenticatorsStateString()

      // if all authenticators are errored, we want to show the download view
      const nonErroredAuthenticators = this.authenticators.filter((authenticator) => !authenticator.isErrored())

      if (nonErroredAuthenticators.length === 0) {
        this.showGetAuthenticators()
      }
    }

    setTimeout(() => {
      this.startRefreshAuthenticatorsTimeout()
    }, 250)
  }

  /**
   * Handles download clicks showing the individual authenticators download modal
   *
   * @param authenticator Authenticator for download representation
   */
  private onDownloadClick(authenticator: Authenticator) {
    this.hideAuthenticatorSelection()
    if (this.getAuthenticatorsView) {
      this.getAuthenticatorsView.hide()
    }

    if (!this.downloadAuthenticatorView) {
      this.downloadAuthenticatorView = new DownloadAuthenticatorModal({
        onGoBack: () => {
          this.downloadAuthenticatorView!.hide()
          this.showGetAuthenticators()
        },
        onClose: this.reset.bind(this)
      })

      this.downloadAuthenticatorView.attach(this.authenticatorModal as HTMLElement)
    }

    this.downloadAuthenticatorView.open(authenticator)
  }

  /**
   * Calls reset on all authenticators, used when retrying authenticator initialization
   * when no active or authenticators are found for the current environment or all available
   * authenticators have errored out
   */
  private resetAuthenticators() {
    this.reset()

    // show the modal overlay
    document.getElementById('ual-modal')!.style.display = 'block'

    this.showAuthenticatorSelection()

    this.authenticators.forEach((authenticator) => authenticator.reset())
  }

  private showGetAuthenticators() {
    if (!this.getAuthenticatorsView) {
      this.getAuthenticatorsView = new GetAuthenticatorModal(
        {
          authenticators: this.authenticators,
          onClose: this.reset.bind(this),
          onDownloadClick: this.onDownloadClick.bind(this),
          onResetAuthenticatorsClick: this.resetAuthenticators.bind(this)
        }
      )

      this.getAuthenticatorsView.attach(this.authenticatorModal as HTMLElement)
    }

    this.hideAuthenticatorSelection()
    this.getAuthenticatorsView.open()
  }

  /**
   * Generates unique string for comparing authenticator states
   */
  private getAuthenticatorsStateString(): string {

    const states = this.authenticators.map((authenticator) => {
      return {
        authenticatorName: authenticator.getStyle().text,
        isLoading: authenticator.isLoading(),
        isErrored: authenticator.isErrored()
      }
    })

    return JSON.stringify(states)
  }

  /**
   *  Cleans up existing authenticators and redraws them so we can
   *  respond to authenticator state changes
   */
  private drawAuthenticatorsButtons() {
    // cleanup
    const listNode = document.getElementById('ual-authenticators-list')

    // variation of this answer here for fast child removal
    // https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript#answer-15771070
    let last = listNode!.lastChild
    while (last != null) {
      listNode!.removeChild(last)
      last = listNode!.lastChild
    }

    this.renderAuthenticationSelections(this.authenticators)
  }

  /**
   * Renders authenticators in the modal selection box
   *
   * @param authenticators Authenticators to render
   */
  protected renderAuthenticationSelections(authenticators: Authenticator[]) {
    const authenticatorsList = document.getElementById('ual-authenticators-list')!

    authenticators.forEach((authenticator: Authenticator) => {
      const authButton = new AuthButton({authenticator, onClick: () => {
        this.onAuthButtonClickHandler(authenticator)
      }}).getComponentElement()

      authenticatorsList.appendChild(authButton)
    })
  }

  /**
   * Resets the ui to it's original state
   */
  public reset() {
    this.showAuthenticatorSelection()

    if (this.accountInputModalView) {
      this.accountInputModalView.hide()
    }
    if (this.messageModalView) {
      this.messageModalView.hide()
    }
    if (this.getAuthenticatorsView ) {
      this.getAuthenticatorsView.hide()
    }

    document.getElementById('ual-modal')!.style.display = 'none'
  }

  /**
   * Login Method handling login UI status and errors
   *
   * @param authenticator Authenticator to login with
   * @param accountName Optional account name for login
   */
  private async login(authenticator: Authenticator, accountName ?: string | undefined) {
    const { text: authenticatorName } = authenticator.getStyle()

    this.hideAuthenticatorSelection()

    this.showMessage({
      title: 'Waiting for Login Response',
      message: `Confirm our login request with ${authenticatorName}`,
      onClose: this.reset.bind(this)
    })

    try {
      await this.loginCallback(authenticator, accountName)

      this.reset()
    } catch (e) {
      if (e instanceof UALError && e.type === UALErrorType.Login) {
        this.showMessage({
          title: `${authenticatorName} errored while logging in:`,
          message: e.message,
          type: MessageTypes.ERROR
        })
      } else {
        this.showMessage({
          title: 'Login Error:',
          message: e.message,
          type: MessageTypes.ERROR
        })
      }
    }
  }

  /**
   * Shows account name input for the provide authenticator
   */
  public showAccountNameInput(authenticator: Authenticator) {
    this.hideAuthenticatorSelection()
    if (!this.accountInputModalView) {

      this.accountInputModalView = new AccountInputModal({
        onGoBack: this.showAuthModal.bind(this),
        onClose: this.showAuthModal.bind(this)
      })

      this.authenticatorModal!.appendChild(this.accountInputModalView.getComponentElement())
    }

    this.accountInputModalView.showInput(authenticator, this.login.bind(this))
  }

  /**
   * Show Authenticator Selector view
   */
  private showAuthenticatorSelection() {
    document.getElementById('ual-modal-selection-content')!.style.display = 'block'
  }

  /**
   * Show Authenticator Selector view
   */
  private hideAuthenticatorSelection() {
    document.getElementById('ual-modal-selection-content')!.style.display = 'none'
  }

  /**
   * Generic message display modal for users.
   *
   * @param modalMessage Message to show
   */
  private showMessage(modalMessage: ModalMessage): void {
    if (this.accountInputModalView) {
      this.accountInputModalView.hide()
    }

    if (!this.messageModalView) {
      this.messageModalView = new MessageModal()
      this.messageModalView.attach(this.authenticatorModal as HTMLElement)
    }

    this.messageModalView.showMessage(modalMessage)
  }

  /**
   * Shows the authentication modal
   */
  public showAuthModal() {
    const nonErroredAuthenticators = this.authenticators.filter((authenticator) => !authenticator.isErrored())
    // if we don't have any authenticators not in an errored stat reset them
    if (nonErroredAuthenticators.length === 0) {
      this.resetAuthenticators()
    }

    this.reset()
    this.showAuthenticatorSelection()
    document.getElementById('ual-modal')!.style.display = 'block'
  }

  /**
   * Adds login button watcher for displaying the auth modal
   */
  private attachLoginButtonWatcher(): void {
    const button = document.getElementById('ual-button')

    button!.addEventListener('click', async () => {
      this.showAuthModal()
    })
  }

  /**
   * Renders the Modal to contain auth continue buttons
   */
  public createAuthenticatorModal(): HTMLElement {
    const modalDiv = document.createElement('div')
    modalDiv.id = 'ual-modal'

    // Authenticator Selection Modal
    const authenticatorSelectionModal = document.createElement('div')
    authenticatorSelectionModal.id = 'ual-modal-selection-content'
    authenticatorSelectionModal.innerHTML = `
      <span class="ual-modal-close">&times;</span>
      <p class="ual-modal-content-description">
        Please select a service to log in
      </p>
      <div id="ual-authenticators-list">
        <em>Loading Authenticators...</em>
      </div>
      <div id="ual-learnMoreContainer" class="opened">
        <div class="ual-open-learnMoreButton">
          &#9432; Learn more
        </div>
        <div class="ual-close-learnMoreButton">
          &#10006; I got it!
        </div>
        <p class="ual-infoExpanded">
          This option allows you to connect to your favorite key manager app.
        </p>
      </div>
    `
    authenticatorSelectionModal.querySelector('.ual-modal-close')!.addEventListener('click', this.reset.bind(this))
    authenticatorSelectionModal.querySelector('.ual-open-learnMoreButton')!.addEventListener('click', () => {
      document.getElementById('ual-learnMoreContainer')!.className = 'closed'
    })

    authenticatorSelectionModal.querySelector('.ual-close-learnMoreButton')!.addEventListener('click', () => {
      document.getElementById('ual-learnMoreContainer')!.className = 'opened'
    })

    authenticatorSelectionModal.querySelector('.ual-modal-close')!.addEventListener('click', this.reset.bind(this))

    modalDiv.appendChild(authenticatorSelectionModal)

    return modalDiv
  }

  /**
   * Determines if the authenticator is ready for dapp interaction
   *
   * @param authenticator UAL Authenticator
   */
  private static authenticatorCanLogin(authenticator: Authenticator) {
    return !authenticator.isLoading() && !authenticator.isErrored()
  }

  /**
   * Handles the click action of Authenticator buttons
   *
   * @param authenticators Authenticators
   */
  private async onAuthButtonClickHandler(authenticator: Authenticator) {
    if (!UALJsDom.authenticatorCanLogin(authenticator)) {
      return
    }
    if (await authenticator.shouldRequestAccountName()) {
      this.showAccountNameInput(authenticator)
    } else {
      this.login(authenticator)
    }
  }

  /**
   * Renders the Auth start button
   */
  public createButton(): HTMLButtonElement {
    const button = document.createElement('button')
    button.id = 'ual-button'
    button.className = 'ual-button-gen' // TODO: determine if this is needed
    button.innerHTML = 'UAL Login'

    return button
  }

  /**
   * Generates the CSS styles for the Auth start button
   *
   * @param css Optional css override for user provided button styles
   */
  public createButtonStyles(css: string | boolean): HTMLStyleElement {

    const buttonStyles = document.createElement('style')
    const cssStyles = css || `
      #ual-button {
        font-family: "Proxima Nova",sans-serif;
        color: white;
        text-align: center;
        background-color: #d8dee5;
        border-radius: 6px;
        font-size: 1em;
        font-weight: bold;
        background-color: rgb(25,50,112);
        cursor: pointer;
        width: 225px;
        padding: 10px 0px;
      }

      @media only screen and (max-width: 480px) {
        #ual-button {
          width: calc(100% - 60px);
        }
      }
    `

    buttonStyles.innerHTML = cssStyles as string
    return buttonStyles
  }

  /**
   * Generates the CSS styles for the Auth Modal
   */
  public createAuthenticatorModalStyles(): HTMLStyleElement {
    const modalStyles = document.createElement('style')
    const modalCss = `
      @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

      /* The Modal (background) */
      #ual-modal {
        display: none; /* Hidden by default */
        position: fixed; /* Stay in place */
        z-index: 10; /* Sit on top */
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto; /* Enable scroll if needed */
        background-color: rgb(0,0,0); /* Fallback color */
        background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
      }

      /* Modal Content/Box */
      #ual-modal-get-authenticator, /* Authenticator download modal */
      #ual-modal-selection-content,
      #ual-modal-input-content {
        font-family: 'Source Sans Pro', sans-serif;
        background-color: #fefefe;
        margin: 10% auto;
        padding: 30px;
        border: 1px solid #888;
        border-radius: 6px;
        width: 370px;
      }

      @media only screen and (max-width: 480px) {
        #ual-modal {
          box-shadow: none;
          margin: 0;
          border-radius: 0px;
          overflow: none;
        }

        #ual-modal-selection-content {
          width: calc(100% - 30px);
          border: 0px;
          border-radius: 0px;
          padding: 15px;
          height: calc(100% - 30px);
          margin: 0px;
        }
      }

      .ual-modal-content-title {
        color: rgb(20, 35, 93);
        margin-top: 5px;
      }

      .ual-modal-content-description {
        color: rgb(20, 35, 93);
        width: 265px;
        font-size: 2em;
        margin: .7em auto
      }

      .ual-modal-text-box {
        width: 265px;
        margin: .7em auto
      }

      /* The Close Button */
      .ual-modal-close {
        color: #aaa;
        float: right;
        font-size: 2em;
        line-height: 0.5em;
        font-weight: bold;
      }

      .ual-modal-close:hover,
      .ual-modal-close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
      }

      /* UALLearnMore */

      /* Button Toggle states */
      #ual-learnMoreContainer {
        width: 260px;
        margin: .7em auto;
      }

      #ual-learnMoreContainer.opened > .ual-open-learnMoreButton {
        display: block;
      }

      #ual-learnMoreContainer.opened > .ual-infoExpanded,
      #ual-learnMoreContainer.opened > .ual-close-learnMoreButton {
        display: none
      }

      #ual-learnMoreContainer.closed > .ual-infoExpanded,
      #ual-learnMoreContainer.closed > .ual-close-learnMoreButton {
        display: block;
      }

      #ual-learnMoreContainer.closed > .ual-open-learnMoreButton {
        display: none;
      }

      .ual-learnMoreText {
        color: rgba(49, 71, 128, 0.7);
        fontSize: 0.8rem;
        fontWeight: 100;
        margin: 0px;
      }

      .ual-open-learnMoreButton,
      .ual-close-learnMoreButton {
        marginTop: 0px;
        color: rgb(72, 151, 248);
        fontSize: 0.9rem;
        fontWeight: 100;
        cursor: pointer;
      }
    `

    modalStyles.innerHTML = modalCss
    return modalStyles
  }
}
