const fs = require('fs')
const {join} = require('path')
const {promisify} = require('util')

const writeFile = promisify(fs.writeFile)

async function saveScreenshot(image, {logger, path, name, suffix}) {
  if (!path) return
  try {
    const timestamp = new Date().toISOString().replace(/[-T:.]/g, '_')
    const filename = `${['screenshot', timestamp, name, suffix].filter(part => part).join('_')}.png`

    await writeFile(join(path, filename), await image.toPng())
  } catch (err) {
    logger.verbose(`Unable to save screenshot: ${err}`)
  }
}

module.exports = saveScreenshot
