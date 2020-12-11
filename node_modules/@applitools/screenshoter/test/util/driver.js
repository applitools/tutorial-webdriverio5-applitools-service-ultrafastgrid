const webdriverio = require('webdriverio')
const utils = require('@applitools/utils')
const driver = require('@applitools/driver')

// #region HELPERS

const LEGACY_ELEMENT_ID = 'ELEMENT'
const ELEMENT_ID = 'element-6066-11e4-a52e-4f735466cecf'

function extractElementId(element) {
  return element.elementId || element[ELEMENT_ID] || element[LEGACY_ELEMENT_ID]
}

function transformSelector(selector) {
  if (utils.types.has(selector, ['type', 'selector'])) {
    if (selector.type === 'css') return `css selector:${selector.selector}`
    else if (selector.type === 'xpath') return `xpath:${selector.selector}`
  }
  return selector
}

// #endregion

// #region UTILITY

function isDriver(page) {
  return page.constructor.name === 'Browser'
}
function isElement(element) {
  if (!element) return false
  return Boolean(element.elementId || element[ELEMENT_ID] || element[LEGACY_ELEMENT_ID])
}
function isSelector(selector) {
  return (
    utils.types.isString(selector) ||
    utils.types.isFunction(selector) ||
    utils.types.has(selector, ['type', 'selector'])
  )
}
function transformElement(element) {
  const elementId = extractElementId(element)
  return {[ELEMENT_ID]: elementId, [LEGACY_ELEMENT_ID]: elementId}
}
function extractSelector(element) {
  return element.selector
}
async function isEqualElements(browser, element1, element2) {
  // NOTE: wdio wraps puppeteer and generate ids by itself just incrementing a counter
  // NOTE: appium for ios could return different ids for same element
  if (browser.isDevTools || browser.isIOS) {
    return browser
      .execute((element1, element2) => element1 === element2, element1, element2)
      .catch(() => false)
  }
  if (!element1 || !element2) return false
  const elementId1 = extractElementId(element1)
  const elementId2 = extractElementId(element2)
  return elementId1 === elementId2
}

// #endregion

// #region COMMANDS

async function executeScript(browser, script, ...args) {
  return browser.execute(script, ...args)
}
async function mainContext(browser) {
  await browser.switchToFrame(null)
  return browser
}
async function parentContext(browser) {
  await browser.switchToParentFrame()
  return browser
}
async function childContext(browser, element) {
  await browser.switchToFrame(element)
  return browser
}
async function findElement(browser, selector) {
  const element = await browser.$(transformSelector(selector))
  return !element.error ? element : null
}
async function findElements(browser, selector) {
  const elements = await browser.$$(transformSelector(selector))
  return Array.from(elements)
}
async function getWindowRect(browser) {
  if (utils.types.isFunction(browser.getWindowRect)) {
    return browser.getWindowRect()
  } else {
    const rect = {x: 0, y: 0, width: 0, height: 0}
    if (utils.types.isFunction(browser.getWindowPosition)) {
      const location = await browser.getWindowPosition()
      rect.x = location.x
      rect.y = location.y
    }
    if (utils.types.isFunction(browser.getWindowSize)) {
      const size = await browser.getWindowSize()
      rect.width = size.width
      rect.height = size.height
    }
    return rect
  }
}
async function setWindowRect(browser, rect = {}) {
  const {x = null, y = null, width = null, height = null} = rect
  if (utils.types.isFunction(browser.setWindowRect)) {
    await browser.setWindowRect(x, y, width, height)
  } else {
    if (utils.types.isFunction(browser.setWindowPosition) && x !== null && y !== null) {
      await browser.setWindowPosition(x, y)
    }
    if (utils.types.isFunction(browser.setWindowSize) && width !== null && height !== null) {
      await browser.setWindowSize(width, height)
    }
  }
}
async function getOrientation(browser) {
  const orientation = await browser.getOrientation()
  return orientation.toLowerCase()
}
async function getDriverInfo(browser) {
  return {
    sessionId: browser.sessionId,
    isMobile: browser.isMobile,
    isNative: browser.isMobile && !browser.capabilities.browserName,
    deviceName: browser.capabilities.desired
      ? browser.capabilities.desired.deviceName
      : browser.capabilities.deviceName,
    platformName: browser.capabilities.platformName || browser.capabilities.platform,
    platformVersion: browser.capabilities.platformVersion,
    browserName: browser.capabilities.browserName,
    browserVersion: browser.capabilities.browserVersion,
  }
}
async function takeScreenshot(driver) {
  return driver.takeScreenshot()
}
async function visit(browser, url) {
  return browser.url(url)
}
async function click(browser, element) {
  if (isSelector(element)) element = await findElement(browser, element)
  return element.click()
}

// #endregion

const spec = {
  isDriver,
  isElement,
  isSelector,
  transformElement,
  extractSelector,
  isEqualElements,
  executeScript,
  mainContext,
  parentContext,
  childContext,
  findElement,
  findElements,
  getWindowRect,
  setWindowRect,
  getOrientation,
  getDriverInfo,
  takeScreenshot,
  visit,
  click,
}

async function makeDriver() {
  const browser = await webdriverio.remote({
    protocol: 'http',
    hostname: 'localhost',
    path: '/wd/hub',
    port: 4444,
    logLevel: 'silent',
    capabilities: {
      browserName: 'chrome',
    },
  })

  const logger = {log: () => null, verbose: () => null}

  return [driver.makeDriver(spec, logger, browser), () => browser.deleteSession()]
}

module.exports = makeDriver
