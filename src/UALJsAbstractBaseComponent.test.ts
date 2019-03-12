import { UALJsAbstractBaseComponent } from './UALJsAbstractBaseComponent'

class TestComponent extends UALJsAbstractBaseComponent {
  protected generateStyles() {
    return '.class { color: blue }'
  }

  protected generateDom() {
    return document.createElement('span')
  }
}

describe('UALJsBaseComponent', () => {
  let component
  let parentContainer

  beforeEach(() => {
    document.body.innerHTML = ''

    component = new TestComponent()
    parentContainer = document.createElement('div')
  })

  it('attaches its dom to the provided container element', () => {
    component.attach(parentContainer)

    expect(parentContainer.childNodes.length).toEqual(1)
  })

  it('returns the dom container element when requested', () => {
    component.attach(parentContainer)
    const componentElement = component.getComponentElement()

    expect(parentContainer.childNodes[0]).toEqual(componentElement)
  })

  it('attaches its styles to the container element', () => {
    const style = [...component.getComponentElement().childNodes].find((element: HTMLElement) => {
      return element instanceof HTMLStyleElement
    })

    expect(style).not.toBeUndefined()
    expect(style.innerHTML).toEqual('.class { color: blue }')
  })

  it('hides when hide is called', () => {
    component.show()
    expect(component.getComponentElement().style.display).toEqual('block')
  })

  it('shows when show is called', () => {
    component.hide()
    expect(component.getComponentElement().style.display).toEqual('none')
  })
})
