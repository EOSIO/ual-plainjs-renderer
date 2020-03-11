import { Authenticator } from 'universal-authenticator-library'
import { UALJsAbstractBaseComponent } from '../UALJsAbstractBaseComponent'

interface AuthButtonOptions {
  authenticator: Authenticator // Authenticator this Auth Button represents
  showDownload?: boolean       // If the button should provide a download option
  key?: number                 // Optional if there are multiple buttons keys are needed for unique bindings
  onClick?: (e: Event) => void // Override default onClick behavior, default behavior is to attempt login
}

export class AuthButton extends UALJsAbstractBaseComponent {

  /**
   * Constructs an Auth Button
   *
   * @param authButtonOptions { authenticator, showDownload, key, onClick }
   */
  constructor(authButtonOptions: AuthButtonOptions) {
    super(authButtonOptions)
  }

  protected generateStyles(): string {
    return `
      .ual-auth-button {
        cursor: pointer;
        color: #ffffff;
        font-size: 1.25em;
        border-radius: 6px;
        margin: .7em auto;
        box-shadow: 0px 0px 5px rgba(0,0,0,0.1);
        opacity: '1';
        width: 260px;
      }

      .ual-auth-icon {
        max-height: 40px;
        max-width: 100%;
        margin: auto;
        margin-top: 7%;
        display: block;
      }

      .ual-auth-icon-wrapper {
        height: 100%;
        display: inline-block;
        float: left;
        width: 50px;
        padding: 4px 10px 8px 10px;
        background-color: rgba(0,0,0,0.15);
        border-radius: 5px 0px 0px 5px;
      }

      .ual-auth-text {
        display: inline-block;
        padding: 12px 13px 12px 15px;
        font-size: 1.25rem;
        font-weight: bold;
        letter-spacing: 1.1px;
      }

      .ual-spinner {
        width: 35px;
        float: right;
        padding: 10px 13px;
      }

      .ual-spinner > div {
        width: 9px;
        height: 9px;

        border-radius: 100%;
        display: inline-block;
        -webkit-animation: ual-bouncedelay 1.4s infinite ease-in-out both;
        animation: ual-bouncedelay 1.4s infinite ease-in-out both;
      }

      .ual-spinner .ual-bounce1 {
        -webkit-animation-delay: -0.32s;
        animation-delay: -0.32s;
      }

      .ual-spinner .ual-bounce2 {
        -webkit-animation-delay: -0.16s;
        animation-delay: -0.16s;
      }

      @-webkit-keyframes ual-bouncedelay {
        0%, 80%, 100% { -webkit-transform: scale(0) }
        40% { -webkit-transform: scale(1.0) }
      }

      @keyframes ual-bouncedelay {
        0%, 80%, 100% {
          -webkit-transform: scale(0);
          transform: scale(0);
        } 40% {
          -webkit-transform: scale(1.0);
          transform: scale(1.0);
        }
      }`
  }

  /**
   * Renders Button element based on current state of authenticator
   */
  protected generateDom(): HTMLElement {
    const { authenticator, showDownload, key } = this.options
    const indexKey = key != null ? `ual-auth-button-${key}` : ''

    let errorMessageTooltip = ''
    let toolTipClass = ''

    let {
      background,
      textColor,
    } = authenticator.getStyle()

    const {
      icon,
      text
    } = authenticator.getStyle()

    const errorColors = {
      DARK_GREY: '#9096A8',
      LIGHT_GREY: '#D5D8E2',
    }

    let stateIconHtml = `
    <i
      class="fa fa-chevron-right"
      style="float: right; padding: 8px; font-size: 1.5em; color: ${authenticator.getStyle().textColor}"
      aria-hidden="true">
    </i>`

    if (!showDownload) {
      if (authenticator.isLoading()) {
        stateIconHtml = `
      <div class="ual-spinner">
        <div class="ual-bounce1" style="background-color: ${authenticator.getStyle().textColor}"></div>
        <div class="ual-bounce2" style="background-color: ${authenticator.getStyle().textColor}"></div>
        <div class="ual-bounce3" style="background-color: ${authenticator.getStyle().textColor}"></div>
      </div>
      `
      }

      if (authenticator.isErrored()) {
        stateIconHtml = `
      <i
        class="fa fa-exclamation-circle"
        style="float:right; padding: 12px; font-size: 1.5rem; color: ${authenticator.getStyle().textColor}"
        aria-hidden="true">
      </i>`

        background = errorColors.LIGHT_GREY
        textColor = errorColors.DARK_GREY
      }

      errorMessageTooltip = authenticator.isErrored() ?
        `data-tippy-content="${authenticator.getError()!.message}"` : ''

      toolTipClass = authenticator.isErrored() ? 'tippy-binding' : ''

    } else {
      stateIconHtml = `
      <i
        class="fa fa-download"
        style="float: right; padding: 8px; font-size: 1.5em; color: ${authenticator.getStyle().textColor}"
        aria-hidden="true">
      </i>`
    }

    const buttonHtml = `
        <div
          class="ual-auth-button ${indexKey} ${toolTipClass}"
          style="background-color: ${background}"
          ${errorMessageTooltip}
        >
          <div class="ual-auth-icon-wrapper">
            <img class="ual-auth-icon" src="${icon}"/>
          </div>
          <div class="ual-auth-text" style="color: ${textColor}">${text}</div>
          ${stateIconHtml}
        </div>
      `

    const button = document.createElement('div')
    button.innerHTML = buttonHtml

    if (this.options.onClick) {
      button.addEventListener('click', this.options.onClick)
    }

    return button
  }
}
