export abstract class UALJsAbstractBaseComponent {
  protected dom: HTMLElement
  protected styleElement: HTMLStyleElement
  protected options: any

  /**
   * Creates component container and attaches generated dom to it
   */
  public constructor(options?: any) {
    this.options = options

    // attach our component to our internal dom
    this.dom = document.createElement('div')
    this.dom.appendChild(this.generateDom())

    // attach our styles to our dom
    this.styleElement = document.createElement('style')
    this.styleElement.innerHTML = this.generateStyles()
    this.dom.appendChild(this.styleElement)
  }

  /**
   * Shows the component
   */
  public show() {
    this.dom.style.display = 'block'
  }

  /**
   * Hides the component
   */
  public hide() {
    this.dom.style.display = 'none'
  }

  /**
   * Return styles this component needs to display properly
   */
  protected abstract generateStyles(): string

  /**
   * Generates and returns dom of the Components
   */
  protected abstract generateDom(): HTMLElement

  /**
   * Attaches the dom of the component to the provided parent
   * element
   *
   * @param parent element the component dom should attach to
   */
  public attach(parent: HTMLElement) {
    parent.appendChild(this.dom)
  }

  /**
   * Helper method to return the parent of the component
   */
  public getComponentElement() {
    return this.dom
  }
}
