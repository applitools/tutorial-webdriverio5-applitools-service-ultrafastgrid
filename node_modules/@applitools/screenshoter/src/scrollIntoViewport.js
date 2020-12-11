const utils = require('@applitools/utils')

async function scrollIntoViewport({logger, context, scroller, region}) {
  if (context.driver.isNative) {
    logger.verbose(`NATIVE context identified, skipping 'ensure element visible'`)
    return
  }
  const elementContextRect = region ? {...region} : await scroller.getClientRect()
  const contextViewportLocation = await context.getLocationInViewport()
  const elementViewportRect = utils.geometry.offset(elementContextRect, contextViewportLocation)
  const viewportRect = await context.main.getRect()
  if (utils.geometry.contains(viewportRect, elementViewportRect)) return {x: 0, y: 0}

  let currentContext = context
  let remainingOffset = {x: elementContextRect.x, y: elementContextRect.y}
  while (currentContext) {
    const scrollRootElement = await currentContext.getScrollRootElement()
    const scrollRootOffset = scrollRootElement
      ? await scrollRootElement.getClientRect().then(rect => ({x: rect.x, y: rect.y}))
      : {x: 0, y: 0}

    const actualOffset = await scroller.moveTo(
      utils.geometry.offsetNegative(remainingOffset, scrollRootOffset),
      scrollRootElement,
    )

    remainingOffset = utils.geometry.offset(
      utils.geometry.offsetNegative(remainingOffset, actualOffset),
      await currentContext.getClientLocation(),
    )
    currentContext = currentContext.parent
  }
  return remainingOffset
}

module.exports = scrollIntoViewport
