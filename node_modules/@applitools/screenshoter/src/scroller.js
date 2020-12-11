const utils = require('@applitools/utils')

function makeScroller({logger, element, scrollingMode = 'mixed'}) {
  const defaultElement = element

  return {
    element,
    moveTo,
    getInnerOffset,
    getSize,
    getClientRect,
    getScrollOffset,
    getTranslateOffset,
    getShiftOffset,
    scrollTo,
    translateTo,
    shiftTo,
    getState,
    restoreState,
  }

  async function moveTo(offset, element = defaultElement) {
    if (scrollingMode === 'scroll') return scrollTo(offset, element)
    if (scrollingMode === 'css') return translateTo(offset, element)
    if (scrollingMode === 'mixed') return shiftTo(offset, element)
  }

  async function getInnerOffset(element = defaultElement) {
    if (scrollingMode === 'scroll') return getScrollOffset(element)
    if (scrollingMode === 'css') return getTranslateOffset(element)
    if (scrollingMode === 'mixed') return getShiftOffset(element)
  }

  async function getSize() {
    const size = await element.getContentSize()
    return size
  }

  async function getClientRect() {
    const region = await element.getClientRect()
    // const location = await element.context.getLocationInPage()
    return region
  }

  async function getScrollOffset(element = defaultElement) {
    try {
      const offset = await element.getScrollOffset()
      return offset
    } catch (err) {
      // Sometimes it is expected e.g. on Appium, otherwise, take care
      logger.verbose(`Failed to extract current scroll offset!`, err)
      return {x: 0, y: 0}
    }
  }

  async function getTranslateOffset(element = defaultElement) {
    try {
      const offset = await element.getTranslateOffset()
      return offset
    } catch (err) {
      // Sometimes it is expected e.g. on Appium, otherwise, take care
      logger.verbose(`Failed to extract current translate offset!`, err)
      return {x: 0, y: 0}
    }
  }

  async function getShiftOffset(element = defaultElement) {
    try {
      const scrollOffset = await element.getScrollOffset()
      const translateOffset = await element.getTranslateOffset()
      return utils.geometry.offset(scrollOffset, translateOffset)
    } catch (err) {
      // Sometimes it is expected e.g. on Appium, otherwise, take care
      logger.verbose(`Failed to set current scroll offset!.`, err)
      return {x: 0, y: 0}
    }
  }

  async function scrollTo(offset, element = defaultElement) {
    try {
      const scrollOffset = await element.scrollTo(offset)
      return scrollOffset
    } catch (err) {
      // Sometimes it is expected e.g. on Appium, otherwise, take care
      logger.verbose(`Failed to set current scroll offset!.`, err)
      return {x: 0, y: 0}
    }
  }

  async function translateTo(offset, element = defaultElement) {
    try {
      await element.scrollTo({x: 0, y: 0})
      const translateOffset = await element.translateTo(offset)
      return translateOffset
    } catch (err) {
      // Sometimes it is expected e.g. on Appium, otherwise, take care
      logger.verbose(`Failed to set current scroll offset!.`, err)
      return {x: 0, y: 0}
    }
  }

  async function shiftTo(offset, element = defaultElement) {
    try {
      const scrollOffset = await element.scrollTo(offset)
      const remainingOffset = utils.geometry.offsetNegative(offset, scrollOffset)
      const translateOffset = await element.translateTo(remainingOffset)

      return utils.geometry.offset(scrollOffset, translateOffset)
    } catch (err) {
      // Sometimes it is expected e.g. on Appium, otherwise, take care
      logger.verbose(`Failed to set current scroll offset!.`, err)
      return {x: 0, y: 0}
    }
  }

  async function getState(element = defaultElement) {
    try {
      const scroll = await element.getScrollOffset()
      const transforms = await element.getTransforms()
      return {scroll, transforms}
    } catch (err) {
      logger.verbose(`Failed to get current transforms!.`, err)
      return {}
    }
  }

  async function restoreState(state, element = defaultElement) {
    try {
      if (state.scroll) {
        await element.scrollTo(state.scroll)
      }
      if (state.transforms) {
        await element.setTransforms(state.transforms)
      }
    } catch (err) {
      logger.verbose(`Failed to restore state!.`, err)
    }
  }
}

module.exports = makeScroller
