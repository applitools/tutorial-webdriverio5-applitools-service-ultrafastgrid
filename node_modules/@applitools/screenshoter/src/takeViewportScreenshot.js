const utils = require('@applitools/utils')
const makeTakeScreenshot = require('./takeScreenshot')
const saveScreenshot = require('./saveScreenshot')
const scrollIntoViewport = require('./scrollIntoViewport')

async function takeViewportScreenshot({
  logger,
  context,
  scroller,
  region,
  rotate,
  crop,
  scale,
  wait,
  debug = {},
}) {
  logger.verbose('Taking image of...')

  await scrollIntoViewport({logger, context, scroller, region})

  const driver = context.driver
  const takeScreenshot = makeTakeScreenshot({logger, driver, rotate, crop, scale, debug})

  const image = await takeScreenshot()

  await utils.general.sleep(wait)

  if (region) {
    const cropRegion = await context.getRegionInViewport(region)
    await image.crop(cropRegion)
    await saveScreenshot(image, {path: debug.path, suffix: 'region'})
  }

  return image
}

module.exports = takeViewportScreenshot
