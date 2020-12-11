const assert = require('assert')
const pixelmatch = require('pixelmatch')
const makeDriver = require('../util/driver')
const screenshoter = require('../../index')
const makeImage = require('../../src/image')

// TODO add overflowed regions tests

describe('screenshoter', () => {
  const logger = {log: () => null, verbose: () => null}
  let driver, destroyDriver

  beforeEach(async () => {
    ;[driver, destroyDriver] = await makeDriver()
    await driver.init()
    await driver.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/')
    await driver.setViewportSize({width: 700, height: 460})
  })

  afterEach(async () => {
    await destroyDriver()
  })

  it('take viewport screenshot', () => {
    return viewport()
  })

  it('take full page screenshot with "scroll" scrolling', () => {
    return fullPage({scrollingMode: 'scroll'})
  })
  it('take full page screenshot with "css" scrolling', () => {
    return fullPage({scrollingMode: 'css'})
  })

  it('take context screenshot with "scroll" scrolling', () => {
    context({scrollingMode: 'scroll'})
  })
  it('take context screenshot with "css" scrolling', () => {
    context({scrollingMode: 'css'})
  })

  it('take full context screenshot with "scroll" scrolling', () => {
    return fullContext({scrollingMode: 'scroll'})
  })
  it('take full context screenshot with "css" scrolling', () => {
    return fullContext({scrollingMode: 'css'})
  })

  it('take region screenshot with "scroll" scrolling', () => {
    region({scrollingMode: 'scroll'})
  })
  it('take region screenshot with "css" scrolling', () => {
    region({scrollingMode: 'css'})
  })

  it('take full region screenshot with "scroll" scrolling', () => {
    return fullRegion({scrollingMode: 'scroll'})
  })
  it('take full region screenshot with "css" scrolling', () => {
    return fullRegion({scrollingMode: 'css'})
  })

  it('take element screenshot with "scroll" scrolling', () => {
    return element({scrollingMode: 'scroll'})
  })
  it('take element screenshot with "css" scrolling', () => {
    return element({scrollingMode: 'css'})
  })

  it('take full element screenshot with "scroll" scrolling', () => {
    return fullElement({scrollingMode: 'scroll'})
  })
  it('take full element screenshot with "css" scrolling', () => {
    return fullElement({scrollingMode: 'css'})
  })

  it('take region in context screenshot with "scroll" scrolling', () => {
    return regionInContext({scrollingMode: 'scroll'})
  })
  it('take region in context screenshot with "css" scrolling', () => {
    return regionInContext({scrollingMode: 'css'})
  })

  it('take full region in context screenshot with "scroll" scrolling', () => {
    return fullRegionInContext({scrollingMode: 'scroll'})
  })
  it('take full region in context screenshot with "css" scrolling', () => {
    return fullRegionInContext({scrollingMode: 'css'})
  })

  it('take element in context screenshot with "scroll" scrolling', () => {
    return elementInContext({scrollingMode: 'scroll'})
  })
  it('take element in context screenshot with "css" scrolling', () => {
    return elementInContext({scrollingMode: 'css'})
  })

  it('take full element in context screenshot with "scroll" scrolling', () => {
    return fullElementInContext({scrollingMode: 'scroll'})
  })
  it('take full element in context screenshot with "css" scrolling', () => {
    return fullElementInContext({scrollingMode: 'css'})
  })

  it('take context in context screenshot with "scroll" scrolling', () => {
    return contextInContext({scrollingMode: 'scroll'})
  })
  it('take context in context screenshot with "css" scrolling', () => {
    return contextInContext({scrollingMode: 'css'})
  })

  it('take full context in context screenshot with "scroll" scrolling', () => {
    return fullContextInContext({scrollingMode: 'scroll'})
  })
  it('take full context in context screenshot with "css" scrolling', () => {
    return fullContextInContext({scrollingMode: 'css'})
  })

  async function viewport(options) {
    const screenshot = await screenshoter({logger, driver, ...options})
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/page.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height),
      0,
    )
  }
  async function fullPage(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      isFully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/page-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height),
      0,
    )
  }
  async function context(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      context: {reference: 'iframe[name="frame1"]'},
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/context.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height),
      0,
    )
  }
  async function fullContext(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      context: {reference: 'iframe[name="frame1"]'},
      isFully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/context-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height),
      0,
    )
  }
  async function region(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      target: {x: 30, y: 500, height: 100, width: 200},
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/region.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height),
      0,
    )
  }
  async function fullRegion(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      target: {x: 30, y: 500, height: 700, width: 200},
      isFully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/region-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height),
      0,
    )
  }
  async function element(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      target: '#overflowing-div-image',
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/element.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height),
      0,
    )
  }
  async function fullElement(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      target: '#overflowing-div-image',
      isFully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/element-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height),
      0,
    )
  }
  async function regionInContext(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      context: {reference: 'iframe[name="frame1"]'},
      target: {x: 10, y: 20, width: 110, height: 120},
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/inner-region.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height),
      0,
    )
  }
  async function fullRegionInContext(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      context: {reference: 'iframe[name="frame1"]'},
      target: {x: 10, y: 100, width: 1000, height: 120},
      isFully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage(
      './test/fixtures/screenshoter/inner-region-fully.png',
    ).toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height),
      0,
    )
  }
  async function elementInContext(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      context: {reference: 'iframe[name="frame1"]'},
      target: '#inner-frame-div',
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/inner-element.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height),
      0,
    )
  }
  async function fullElementInContext(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      context: {reference: 'iframe[name="frame1"]'},
      target: '#inner-frame-div',
      isFully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage(
      './test/fixtures/screenshoter/inner-element-fully.png',
    ).toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height),
      0,
    )
  }
  async function contextInContext(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      context: {
        reference: 'iframe[name="frame1-1"]',
        parent: {reference: 'iframe[name="frame1"]'},
      },
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/inner-context.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height),
      0,
    )
  }
  async function fullContextInContext(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      context: {
        reference: 'iframe[name="frame1-1"]',
        parent: {reference: 'iframe[name="frame1"]'},
      },
      isFully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage(
      './test/fixtures/screenshoter/inner-context-fully.png',
    ).toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height),
      0,
    )
  }
})
