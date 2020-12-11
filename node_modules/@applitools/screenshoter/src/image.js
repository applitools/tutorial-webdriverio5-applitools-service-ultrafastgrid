const utils = require('@applitools/utils')
const sharp = require('sharp')

function makeImage(data) {
  let image, size
  if (utils.types.isBase64(data)) {
    const buffer = Buffer.from(data, 'base64')
    image = fromBuffer(buffer)
    size = extractPngSize(buffer)
  } else if (utils.types.isString(data)) {
    image = fromFile(data)
  } else if (Buffer.isBuffer(data)) {
    image = fromBuffer(data)
    size = extractPngSize(data)
  } else {
    image = fromSize(data)
    size = data
  }

  return {
    get width() {
      return image.info ? image.info.width : size.width
    },
    get height() {
      return image.info ? image.info.height : size.height
    },
    async scale(scaleRatio) {
      image = await scale(await image, scaleRatio)
      return this
    },
    async crop(region) {
      image = await crop(await image, region)
      return this
    },
    async rotate(degree) {
      image = await rotate(await image, degree)
      return this
    },
    async copy(image2, offset) {
      image = await copy(await image, image2, offset)
      return this
    },
    async toObject() {
      image = await image
      return image
    },
    async toBuffer() {
      image = await image
      return image.data
    },
    async toPng() {
      return toPng(await image)
    },
  }
}

async function fromFile(path) {
  return sharp(path)
    .raw()
    .toBuffer({resolveWithObject: true})
}

async function fromBuffer(buffer) {
  return sharp(buffer)
    .raw()
    .toBuffer({resolveWithObject: true})
}

async function fromSize(size) {
  return sharp({
    create: {
      width: Math.round(size.width),
      height: Math.round(size.height),
      channels: 4,
      background: {r: 0, g: 0, b: 0},
    },
  })
    .raw()
    .toBuffer({resolveWithObject: true})
}

async function toPng(image) {
  return sharp(image.data, {raw: image.info})
    .png()
    .toBuffer()
}

async function scale(image, scaleRatio) {
  const aspectRatio = image.info.height / image.info.width
  const width = Math.ceil(image.info.width * scaleRatio)
  const height = Math.ceil(width * aspectRatio)
  return sharp(image.data, {raw: image.info})
    .resize({width, height})
    .raw()
    .toBuffer({resolveWithObject: true})
}

async function crop(image, region) {
  if (utils.types.has(region, 'left')) {
    region = {
      x: region.left,
      y: region.top,
      width: image.info.width - region.left - region.right,
      height: image.info.height - region.top - region.bottom,
    }
  }
  return sharp(image.data, {raw: image.info})
    .extract({
      left: Math.round(Math.max(0, region.x)),
      top: Math.round(Math.max(0, region.y)),
      width: Math.round(Math.min(region.width, image.info.width - region.x)),
      height: Math.round(Math.min(region.height, image.info.height - region.y)),
    })
    .raw()
    .toBuffer({resolveWithObject: true})
}

async function rotate(image, degree) {
  return sharp(image.data, {raw: image.info})
    .rotate(degree)
    .raw()
    .toBuffer({resolveWithObject: true})
}

async function copy(image1, image2, offset) {
  return sharp(image1.data, {raw: image1.info})
    .composite([
      {input: image2.data, raw: image2.info, left: Math.round(offset.x), top: Math.round(offset.y)},
    ])
    .raw()
    .toBuffer({resolveWithObject: true})
}

function extractPngSize(buffer) {
  return buffer.slice(12, 16).toString('ascii') === 'IHDR'
    ? {width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20)}
    : {width: 0, height: 0}
}

module.exports = makeImage
