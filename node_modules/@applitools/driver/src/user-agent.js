const utils = require('@applitools/utils')

const OSNames = {
  Android: 'Android',
  ChromeOS: 'Chrome OS',
  IOS: 'iOS',
  Linux: 'Linux',
  Macintosh: 'Macintosh',
  MacOSX: 'Mac OS X',
  Unknown: 'Unknown',
  Windows: 'Windows',
}

const BrowserNames = {
  Edge: 'Edge',
  IE: 'IE',
  Firefox: 'Firefox',
  Chrome: 'Chrome',
  Safari: 'Safari',
  Chromium: 'Chromium',
}

const MAJOR_MINOR = '(\\d+)(?:[_.](\\d+))?'
const PRODUCT = `(?:(%s)/${MAJOR_MINOR})`

// Browser Regexes
const VALUES_FORbrowser_REGEX_EXCEPT_IE = ['Opera', 'Edg', 'Chrome', 'Safari', 'Firefox', 'Edge']
const IEbrowser_REGEX = new RegExp(`(?:MS(IE) ${MAJOR_MINOR})`)

const getBrowserRegExes = () => {
  const browserRegExes = []

  for (let i = 0; i < VALUES_FORbrowser_REGEX_EXCEPT_IE.length; i += 1) {
    const browser = VALUES_FORbrowser_REGEX_EXCEPT_IE[i]
    browserRegExes.push(new RegExp(PRODUCT.replace('%s', browser)))
  }

  // Last pattern is IE
  browserRegExes.push(IEbrowser_REGEX)
  return browserRegExes
}

const VERSION_REGEX = new RegExp(PRODUCT.replace('%s', 'Version'))

const OS_REGEXES = [
  new RegExp(`(?:(Windows NT) ${MAJOR_MINOR})`),
  new RegExp('(?:(Windows XP))'),
  new RegExp('(?:(Windows 2000))'),
  new RegExp('(?:(Windows NT))'),
  new RegExp('(?:(Windows))'),
  new RegExp(`(?:(Mac OS X) ${MAJOR_MINOR})`),
  new RegExp(`(?:(Android) ${MAJOR_MINOR})`),
  new RegExp(`(?:(CPU(?: i[a-zA-Z]+)? OS) ${MAJOR_MINOR})`),
  new RegExp('(?:(Mac OS X))'),
  new RegExp('(?:(Mac_PowerPC))'),
  new RegExp('(?:(Linux))'),
  new RegExp('(?:(CrOS))'),
  new RegExp('(?:(SymbOS))'),
]

const HIDDEN_IE_REGEX = new RegExp(`(?:rv:${MAJOR_MINOR}\\) like Gecko)`)

const EDGE_REGEX = new RegExp(PRODUCT.replace('%s', 'Edge'))

function parseUserAgent(userAgent, unknowns) {
  utils.guard.notNull(userAgent, {name: 'userAgent'})

  userAgent = userAgent.trim()
  const result = {}

  // OS
  const oss = new Map()
  const matchers = []

  for (let i = 0; i < OS_REGEXES.length; i += 1) {
    if (OS_REGEXES[i].test(userAgent)) {
      matchers.push(OS_REGEXES[i].exec(userAgent))
      break
    }
  }

  for (let i = 0; i < matchers.length; i += 1) {
    const os = matchers[i][1]
    if (os) {
      oss.set(os.toLowerCase(), matchers[i])
    }
  }

  let osmatch
  if (matchers.length === 0) {
    if (unknowns) {
      result.os = OSNames.Unknown
    } else {
      throw new TypeError(`Unknown OS: ${userAgent}`)
    }
  } else {
    if (oss.size > 1 && oss.has('android')) {
      osmatch = oss.get('android')
    } else {
      osmatch = oss.get(oss.keys().next().value)
    }

    result.os = osmatch[1]
    if (osmatch.length > 1) {
      result.osMajorVersion = osmatch[2]
      result.osMinorVersion = osmatch[3]
    }

    if (result.osMajorVersion && !result.osMinorVersion) {
      result.osMinorVersion = '0'
    }
  }

  // OS Normalization

  if (result.os.startsWith('CPU')) {
    result.os = OSNames.IOS
  } else if (result.os === 'Windows XP') {
    result.os = OSNames.Windows
    result.osMajorVersion = '5'
    result.osMinorVersion = '1'
  } else if (result.os === 'Windows 2000') {
    result.os = OSNames.Windows
    result.osMajorVersion = '5'
    result.osMinorVersion = '0'
  } else if (result.os === 'Windows NT') {
    result.os = OSNames.Windows
    if (result.osMajorVersion === '6' && result.osMinorVersion === '1') {
      result.osMajorVersion = '7'
      result.osMinorVersion = '0'
    } else if (result.osMajorVersion === '6' && result.osMinorVersion === '2') {
      result.osMajorVersion = '8'
      result.osMinorVersion = '0'
    } else if (result.osMajorVersion === '6' && result.osMinorVersion === '3') {
      result.osMajorVersion = '8'
      result.osMinorVersion = '1'
    } else if (!result.osMajorVersion) {
      result.osMajorVersion = '4'
      result.osMinorVersion = '0'
    }
  } else if (result.os === 'Mac_PowerPC') {
    result.os = OSNames.Macintosh
  } else if (result.os === 'CrOS') {
    result.os = OSNames.ChromeOS
  }

  // Browser
  let browserOK = false
  const browserRegexes = getBrowserRegExes()
  for (let i = 0; i < browserRegexes.length; i += 1) {
    if (browserRegexes[i].test(userAgent)) {
      const matcher = browserRegexes[i].exec(userAgent)
      result.browser = matcher[1]
      result.browserMajorVersion = matcher[2]
      result.getBrowserMinorVersion = matcher[3]
      browserOK = true
      break
    }
  }

  if (result.os === OSNames.Windows) {
    if (EDGE_REGEX.test(userAgent)) {
      const edgeMatch = EDGE_REGEX.exec(userAgent)
      result.browser = BrowserNames.Edge
      result.browserMajorVersion = edgeMatch[2]
      result.getBrowserMinorVersion = edgeMatch[3]
    }

    // IE11 and later is "hidden" on purpose.
    // http://blogs.msdn.com/b/ieinternals/archive/2013/09/21/internet-explorer-11-user-agent-string-ua-string-sniffing-compatibility-with-gecko-webkit.aspx
    if (HIDDEN_IE_REGEX.test(userAgent)) {
      const ieMatch = HIDDEN_IE_REGEX.exec(userAgent)
      result.browser = BrowserNames.IE
      result.browserMajorVersion = ieMatch[1]
      result.getBrowserMinorVersion = ieMatch[2]
      browserOK = true
    }
  }

  if (result.browser === 'Edg') {
    result.browser = 'Edge'
  }

  if (!browserOK) {
    if (unknowns) {
      result.browser = 'Unknown'
    } else {
      throw new TypeError(`Unknown browser: ${userAgent}`)
    }
  }

  // Explicit browser version (if available)
  if (VERSION_REGEX.test(userAgent)) {
    const versionMatch = VERSION_REGEX.exec(userAgent)
    result.browserMajorVersion = versionMatch[2]
    result.getBrowserMinorVersion = versionMatch[3]
  }

  return result
}

module.exports = parseUserAgent
