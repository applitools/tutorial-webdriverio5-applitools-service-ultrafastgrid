const utils = require('@applitools/utils')
const makeImage = require('./image')
const makeTakeScreenshot = require('./takeScreenshot')
const saveScreenshot = require('./saveScreenshot')
const scrollIntoViewport = require('./scrollIntoViewport')

async function takeStitchedImage({
  logger,
  context,
  scroller,
  region,
  rotate,
  crop,
  scale,
  overlap = 50,
  wait,
  debug = {},
}) {
  logger.verbose('Taking full image of...')

  const scrollerState = await scroller.getState()
  const scrollerRegion = utils.geometry.region({x: 0, y: 0}, await scroller.getSize())
  logger.verbose(`Scroller size: ${scrollerRegion}`)

  await scrollIntoViewport({logger, context, scroller, region})

  const driver = context.driver
  const takeScreenshot = makeTakeScreenshot({logger, driver, rotate, crop, scale, debug})

  const initialOffset = region ? utils.geometry.location(region) : {x: 0, y: 0}
  const actualOffset = await scroller.moveTo(initialOffset)
  const expectedRemainingOffset = utils.geometry.offsetNegative(initialOffset, actualOffset)

  await utils.general.sleep(wait)

  logger.verbose('Getting initial image...')
  let image = await takeScreenshot({name: 'initial'})

  const cropRegion = await context.getRegionInViewport(region || (await scroller.getClientRect()))

  logger.verbose('cropping...')
  await image.crop(cropRegion)
  await saveScreenshot(image, {path: debug.path, name: 'initial', suffix: 'region'})

  if (region) region = utils.geometry.intersect(region, scrollerRegion)
  else region = scrollerRegion

  region = {
    x: Math.round(region.x),
    y: Math.round(region.y),
    width: Math.round(region.width),
    height: Math.round(region.height),
  }

  const partSize = {width: image.width, height: Math.max(image.height - overlap, 10)}
  logger.verbose(`Image part size: ${partSize}`)

  const [_, ...partRegions] = utils.geometry.divide(region, partSize)
  logger.verbose('Part regions', partRegions)

  logger.verbose('Creating stitched image composition container')
  const composition = makeImage({width: region.width, height: region.height})

  logger.verbose('Adding initial image...')
  await composition.copy(await image.toObject(), {x: 0, y: 0})

  logger.verbose('Getting the rest of the image parts...')

  let stitchedSize = {width: image.width, height: image.height}
  for (const partRegion of partRegions) {
    const partOffset = {x: partRegion.x, y: partRegion.y}
    const partSize = {width: partRegion.width, height: partRegion.height}
    const partName = `${partRegion.x}_${partRegion.y}_${partRegion.width}x${partRegion.height}`

    logger.verbose(`Processing part ${partName}`)

    logger.verbose(`Move to ${partOffset}`)
    const actualOffset = await scroller.moveTo(partOffset)
    const remainingOffset = utils.geometry.offsetNegative(
      utils.geometry.offsetNegative(partOffset, actualOffset),
      expectedRemainingOffset,
    )
    const cropPartRegion = {
      x: cropRegion.x + remainingOffset.x,
      y: cropRegion.y + remainingOffset.y,
      width: Math.min(cropRegion.width, partSize.width),
      height: Math.min(cropRegion.height, partSize.height),
    }
    logger.verbose(`Actual offset is ${actualOffset}, remaining offset is ${remainingOffset}`)

    await utils.general.sleep(wait)

    // TODO maybe remove
    if (!utils.geometry.isEmpty(cropPartRegion)) {
      logger.verbose('Getting image...')
      image = await takeScreenshot({name: partName})

      logger.verbose('cropping...')
      await image.crop(cropPartRegion)
      await saveScreenshot(image, {path: debug.path, name: partName, suffix: 'region'})

      await composition.copy(
        await image.toObject(),
        utils.geometry.offsetNegative(partOffset, initialOffset),
      )

      stitchedSize = {width: partOffset.x + image.width, height: partOffset.y + image.height}
    }
  }

  await scroller.restoreState(scrollerState)

  logger.verbose(`Extracted entire size: ${region}`)
  logger.verbose(`Actual stitched size: ${stitchedSize}`)

  if (stitchedSize.width < composition.width || stitchedSize.height < composition.height) {
    logger.verbose('Trimming unnecessary margins...')
    await composition.crop({
      x: 0,
      y: 0,
      width: Math.min(stitchedSize.width, composition.width),
      height: Math.min(stitchedSize.height, composition.height),
    })
  }

  await saveScreenshot(composition, {path: debug.path, name: 'stitched'})
  return composition
}

module.exports = takeStitchedImage
