const scripts = require('./scripts')

/**
 * @template TDriver - TDriver provided by wrapped framework
 * @template TElement - TElement provided by wrapped framework
 * @template TSelector - TSelector supported by framework
 */
class Element {
  static specialize(spec) {
    return class SpecializedElement extends Element {
      static get spec() {
        return spec
      }
      get spec() {
        return spec
      }
    }
  }

  static get spec() {
    throw new TypeError('The class is not specialized. Create a specialize Element first')
  }

  constructor(logger, context, {element, selector, index} = {}) {
    if (element instanceof Element) {
      return element
    }
    if (this.spec.isElement(element)) {
      this._element = this.spec.transformElement ? this.spec.transformElement(element) : element
      // Some frameworks contains information about the selector inside an element
      this._selector = selector || (this.spec.extractSelector && this.spec.extractSelector(element))
      this._index = index
    } else if (this.spec.isSelector(selector)) {
      this._selector = selector
    } else {
      throw new TypeError('Element constructor called with argument of unknown type!')
    }
    if (logger) {
      this._logger = logger
    }
    if (context) {
      this._context = context
    }
  }

  get spec() {
    throw new TypeError('The class is not specialized. Create a specialize Element first')
  }

  get unwrapped() {
    return this._element
  }

  get selector() {
    return this._selector
  }

  get context() {
    return this._context
  }

  get isRef() {
    return this._context.isRef || !this._element
  }

  async equals(element) {
    if (this.isRef) return false
    return this.spec.isEqualElements(
      this._context.unwrapped,
      this._element,
      element instanceof Element ? element.unwrapped : element,
    )
  }

  async init(context) {
    this._context = context
    this._logger = context._logger
    if (this._element) return this

    if (this._selector) {
      const element = await this._context.element(this._selector)
      if (!element) throw new Error(this._selector) //TODO: Element not found
      this._element = element.unwrapped
      return element
    }
  }

  async getRect() {
    return this.withRefresh(async () => {
      if (this._context.driver.isNative) {
        return this.spec.getElementRect(this._context.unwrapped, this._element)
      } else {
        return scripts.getElementRect(this._logger, this._context, this)
      }
    })
  }

  async getClientRect() {
    return this.withRefresh(() => scripts.getElementClientRect(this._logger, this._context, this))
  }

  async getContentSize() {
    return this.withRefresh(() => scripts.getElementContentSize(this._logger, this._context, this))
  }

  async isScrollable() {
    return this.withRefresh(() => scripts.isScrollable(this._logger, this._context, this))
  }

  async scrollTo(offset) {
    return this.withRefresh(() => scripts.scrollTo(this._logger, this._context, offset, this))
  }

  async translateTo(offset) {
    return this.withRefresh(() => scripts.translateTo(this._logger, this._context, offset, this))
  }

  async getScrollOffset() {
    return this.withRefresh(() => scripts.getScrollOffset(this._logger, this._context, this))
  }

  async getTranslateOffset() {
    return this.withRefresh(() => scripts.getTranslateOffset(this._logger, this._context, this))
  }

  async getTransforms() {
    return this.withRefresh(() => scripts.getTransforms(this._logger, this._context, this))
  }

  async hideScrollbars() {
    return this.withRefresh(async () => {
      this._originalOverflow = await scripts.setOverflow(
        this._logger,
        this._context,
        'hidden',
        this,
      )
      return this._originalOverflow
    })
  }

  async restoreScrollbars() {
    return this.withRefresh(async () => {
      await scripts.setOverflow(this._logger, this._context, this._originalOverflow, this)
    })
  }

  async preservePosition(positionProvider) {
    return this.withRefresh(async () => {
      this._positionMemento = await positionProvider.getState(this)
      return this._positionMemento
    })
  }

  async restorePosition(positionProvider) {
    if (this._positionMemento) {
      return this.withRefresh(async () => {
        await positionProvider.restoreState(this._positionMemento, this)
      })
    }
  }

  async refresh(freshElement) {
    if (this.spec.isElement(freshElement)) {
      this._element = freshElement
      return true
    }
    if (!this._selector) return false
    const element = await this._context.element(this._selector)
    if (element) {
      this._element = element.unwrapped
    }
    return Boolean(element)
  }
  /**
   * Wrap an operation on the element and handle stale element reference if such happened during operation
   * @param {Function} operation - operation on the element
   * @return {Promise<*>} promise which resolve whatever an operation will resolve
   */
  async withRefresh(operation) {
    if (!this.spec.isStaleElementError) return operation()
    try {
      const result = await operation()
      // Some frameworks could handle stale element reference error by itself or doesn't throw an error
      if (this.spec.isStaleElementError(result, this.selector)) {
        const freshElement = this.spec.extractElement ? this.spec.extractElement(result) : result
        await this.refresh(freshElement)
        return operation()
      }

      return result
    } catch (err) {
      if (!this.spec.isStaleElementError(err)) throw err
      const refreshed = await this.refresh()
      if (refreshed) return operation()
      else throw err
    }
  }
  /**
   * @override
   */
  toJSON() {
    return this.unwrapped
  }
}

module.exports = Element
