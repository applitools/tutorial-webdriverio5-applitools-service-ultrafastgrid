const utils = require('@applitools/utils')
const saveScreenshot = require('./saveScreenshot')
const findPattern = require('./findPattern')
const makeCalculateScaleRatio = require('./calculateScaleRatio')
const makeImage = require('./image')

// TODO remove all ImageProviders

function makeTakeScreenshot(options) {
  const {driver} = options
  if (driver.isNative) {
    return makeTakeNativeScreenshot(options)
  } else if (driver.userAgent) {
    if (driver.userAgent.browser === 'Firefox') {
      // TODO
    } else if (driver.userAgent.browser === 'Safari') {
      if (driver.userAgent.os === 'iOS') {
        return makeTakeMarkedScreenshot(options)
      } else if (this._driver.userAgent.browserMajorVersion === '11') {
        return makeTakeSafari11Screenshot(options)
      }
    }
  }
  return makeTakeDefaultScreenshot(options)
}

function makeTakeDefaultScreenshot({logger, driver, rotate, crop, scale, debug = {}}) {
  let calculateScaleRatio
  return async function takeScreenshot({name} = {}) {
    logger.verbose('Taking screenshot...')
    const image = makeImage(await driver.takeScreenshot())
    await saveScreenshot(image, {path: debug.path, name, suffix: 'original'})

    if (rotate) {
      await image.rotate(rotate)
      await saveScreenshot(image, {path: debug.path, name, suffix: 'rotated'})
    }

    if (crop) {
      await image.crop(crop)
      await saveScreenshot(image, {path: debug.path, name, suffix: 'cropped'})
    }

    if (scale) {
      await image.scale(scale)
    } else {
      if (!calculateScaleRatio) {
        const viewportSize = await driver.getViewportSize()
        const documentSize = await driver.mainContext.getDocumentSize()
        calculateScaleRatio = makeCalculateScaleRatio({
          viewportWidth: viewportSize.width,
          documentWidth: documentSize.width,
          pixelRatio: await driver.getPixelRatio(),
        })
      }
      await image.scale(calculateScaleRatio(image.width))
    }
    await saveScreenshot(image, {path: debug.path, name, suffix: 'scaled'})

    return image
  }
}

function makeTakeSafari11Screenshot({logger, driver, rotate, crop, scale, debug = {}}) {
  let pixelRatio = null
  let viewportSize = null
  let calculateScaleRatio = null

  return async function takeScreenshot({name} = {}) {
    logger.verbose('Taking safari 11 driver screenshot...')
    const image = makeImage(await driver.takeScreenshot())
    await saveScreenshot(image, {path: debug.path, name, suffix: 'original'})

    if (rotate) {
      await image.rotate(rotate)
      await saveScreenshot(image, {path: debug.path, name, suffix: 'rotated'})
    }

    if (crop) {
      await image.crop(crop)
    } else {
      if (!pixelRatio) pixelRatio = await driver.getPixelRatio()
      if (!viewportSize) viewportSize = await driver.getViewportSize()
      const viewportLocation = await driver.mainContext.getScrollOffset()
      await image.crop(utils.geometry.scale({...viewportLocation, ...viewportSize}, pixelRatio))
    }
    await saveScreenshot(image, {path: debug.path, name, suffix: 'cropped'})

    if (scale) {
      await image.scale(scale)
    } else {
      if (!calculateScaleRatio) {
        if (!pixelRatio) pixelRatio = await driver.getPixelRatio()
        if (!viewportSize) viewportSize = await driver.getViewportSize()
        const documentSize = await driver.mainContext.getDocumentSize()
        calculateScaleRatio = makeCalculateScaleRatio({
          viewportWidth: viewportSize.width,
          documentWidth: documentSize.width,
          pixelRatio,
        })
      }
      await image.scale(calculateScaleRatio(image.width))
    }
    await saveScreenshot(image, {path: debug.path, name, suffix: 'scaled'})

    return image
  }
}

function makeTakeMarkedScreenshot({logger, driver, rotate, crop, scale, debug = {}}) {
  let calculateScaleRatio = null
  let viewportRegion = null

  return async function takeScreenshot({name} = {}) {
    logger.verbose('Taking viewport screenshot (using markers)...')
    const image = makeImage(await driver.takeScreenshot())
    await saveScreenshot(image, {path: debug.path, name, suffix: 'original'})

    if (rotate) {
      await image.rotate(rotate)
      await saveScreenshot(image, {path: debug.path, name, suffix: 'rotated'})
    }

    if (crop) {
      await image.crop(crop)
    } else {
      if (!viewportRegion) viewportRegion = await getViewportRegion()
      await image.crop(viewportRegion)
    }
    await saveScreenshot(image, {path: debug.path, name, suffix: 'cropped'})

    if (scale) {
      await image.scale(scale)
    } else {
      if (!calculateScaleRatio) {
        const viewportSize = await driver.getViewportSize()
        const documentSize = await driver.mainContext.getDocumentSize()
        calculateScaleRatio = makeCalculateScaleRatio({
          viewportWidth: viewportSize.width,
          documentWidth: documentSize.width,
          pixelRatio: await driver.getPixelRatio(),
        })
      }
      await image.scale(calculateScaleRatio(image.width))
    }
    await saveScreenshot(image, {path: debug.path, name, suffix: 'scaled'})

    return image
  }

  async function getViewportRegion() {
    const marker = await driver.addPageMarker()
    try {
      const image = makeImage(await driver.takeScreenshot())
      if (rotate) await image.rotate(rotate)

      await saveScreenshot(image, 'marker')

      const markerLocation = findPattern(await image.toObject(), marker)
      if (!markerLocation) return null

      const pixelRation = await driver.getPixelRatio()
      const viewportSize = await driver.getViewportSize()
      const scaledViewportSize = utils.geometry.scale(viewportSize, pixelRation)

      return {...markerLocation, ...scaledViewportSize}
    } finally {
      await driver.cleanupPageMarker()
    }
  }
}

function makeTakeNativeScreenshot({logger, driver, rotate, crop, scale, debug = {}}) {
  return async function takeScreenshot({name} = {}) {
    logger.verbose('Taking native driver screenshot...')
    const image = makeImage(
      crop || process.env.APPLITOOLS_SKIP_MOBILE_NATIVE_SCREENSHOT_HOOK
        ? await driver.takeScreenshot()
        : await takeViewportScreenshot(),
    )
    await saveScreenshot(image, {path: debug.path, name, suffix: 'original'})

    if (rotate) {
      await image.rotate(rotate)
      await saveScreenshot(image, {path: debug.path, name, suffix: 'rotated'})
    }

    if (crop) {
      await image.crop(crop)
      await saveScreenshot(image, {path: debug.path, name, suffix: 'cropped'})
    }

    if (scale) {
      await image.scale(scale)
      await saveScreenshot(image, {path: debug.path, name, suffix: 'scaled'})
    }

    process.env.APPLITOOLS_SKIP_MOBILE_NATIVE_SCREENSHOT_HOOK = undefined // TODO remove

    return image
  }

  async function takeViewportScreenshot() {
    const base64 = await driver.execute('mobile: viewportScreenshot')
    // trimming line breaks since 3rd party grid providers can return them
    return base64.replace(/\r\n/g, '')
  }
}

module.exports = makeTakeScreenshot
