const utils = require('@applitools/utils')
const makeScroller = require('./scroller')
const takeStitchedScreenshot = require('./takeStitchedScreenshot')
const takeViewportScreenshot = require('./takeViewportScreenshot')

async function screenshoter({
  logger,
  driver,
  context,
  target,
  isFully,
  hideScrollbars,
  hideCaret,
  scrollingMode,
  overlap,
  wait,
  rotate,
  crop,
  scale,
  debug,
}) {
  const originalContext = driver.currentContext
  const defaultScroller = makeScroller({logger, scrollingMode})

  const targetContext = context ? await originalContext.context(context) : originalContext
  const scrollingStates = []
  for (const nextContext of targetContext.path) {
    const scrollingElement = await nextContext.getScrollRootElement()
    if (hideScrollbars) await scrollingElement.hideScrollbars()
    const scrollingState = await defaultScroller.getState(scrollingElement)
    scrollingStates.push(scrollingState)
  }

  const activeElement = hideCaret && !driver.isNative ? await targetContext.blurElement() : null

  const area = await getTargetArea({logger, context: targetContext, target, isFully, scrollingMode})

  try {
    const image = isFully
      ? await takeStitchedScreenshot({...area, logger, rotate, crop, scale, wait, overlap, debug})
      : await takeViewportScreenshot({...area, logger, rotate, crop, scale, debug})

    return {image, region: area.region || (await area.scroller.getClientRect())}
  } finally {
    if (hideCaret && activeElement) await targetContext.focusElement(activeElement)

    for (const prevContext of targetContext.path.reverse()) {
      const scrollingElement = await prevContext.getScrollRootElement()
      if (hideScrollbars) await scrollingElement.restoreScrollbars()
      const scrollingState = scrollingStates.shift()
      await defaultScroller.restoreState(scrollingState, scrollingElement)
    }

    await originalContext.focus()
  }
}

async function getTargetArea({logger, context, target, isFully, scrollingMode}) {
  if (target) {
    if (utils.types.has(target, ['x', 'y', 'width', 'height'])) {
      const scrollingElement = await context.getScrollRootElement()
      return {
        context,
        region: target,
        scroller: makeScroller({logger, element: scrollingElement, scrollingMode}),
      }
    } else {
      const element = await context.element(target)
      if (!element) throw new Error('Element not found!')

      if (isFully) {
        const isScrollable = await element.isScrollable()
        const scrollingElement = isScrollable ? element : await context.getScrollRootElement()
        return {
          context,
          region: isScrollable ? null : await element.getRect(),
          scroller: makeScroller({
            logger,
            element: scrollingElement,
            scrollingMode: isScrollable && scrollingMode === 'css' ? 'mixed' : scrollingMode,
          }),
        }
      } else {
        const scrollingElement = await context.getScrollRootElement()
        return {
          context,
          region: await element.getRect(),
          scroller: makeScroller({logger, element: scrollingElement, scrollingMode}),
        }
      }
    }
  } else if (!context.isMain && !isFully) {
    const scrollingElement = await context.parent.getScrollRootElement()
    const element = await context.getFrameElement()
    return {
      context: context.parent,
      region: await element.getClientRect(),
      scroller: makeScroller({logger, element: scrollingElement, scrollingMode}),
    }
  } else {
    const scrollingElement = await context.getScrollRootElement()
    return {
      context,
      scroller: makeScroller({logger, element: scrollingElement, scrollingMode}),
    }
  }
}

module.exports = screenshoter
