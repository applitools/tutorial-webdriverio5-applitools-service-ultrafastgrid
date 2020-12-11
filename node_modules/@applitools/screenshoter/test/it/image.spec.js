const assert = require('assert')
const fs = require('fs')
const pixelmatch = require('pixelmatch')
const makeImage = require('../../src/image')

describe('image', () => {
  it('should provide access to image width/height before it parsed', async () => {
    const buffer = fs.readFileSync('./test/fixtures/image/lena.png')
    const image = makeImage(buffer)
    assert.strictEqual(image.width, 512)
    assert.strictEqual(image.height, 512)
  })

  it('should crop by region', async () => {
    const actual = await makeImage('./test/fixtures/image/lena.png')
      .crop({x: 100, y: 120, width: 200, height: 200})
      .then(image => image.toObject())
    const expected = await makeImage('./test/fixtures/image/lena.cropped-region.png').toObject()
    assert.ok(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height) === 0,
    )
  })

  it('should crop by rect', async () => {
    const actual = await makeImage('./test/fixtures/image/lena.png')
      .crop({left: 100, right: 110, top: 120, bottom: 130})
      .then(image => image.toObject())
    const expected = await makeImage('./test/fixtures/image/lena.cropped-rect.png').toObject()
    assert.ok(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height) === 0,
    )
  })

  it('should scale', async () => {
    const actual = await makeImage('./test/fixtures/image/lena.png')
      .scale(0.5)
      .then(image => image.toObject())
    const expected = await makeImage('./test/fixtures/image/lena.scaled.png').toObject()
    assert.ok(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height) === 0,
    )
  })

  it('should rotate', async () => {
    const actual = await makeImage('./test/fixtures/image/lena.png')
      .rotate(90)
      .then(image => image.toObject())
    const expected = await makeImage('./test/fixtures/image/lena.rotated.png').toObject()
    assert.ok(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height) === 0,
    )
  })

  it('should copy one image to another', async () => {
    const image = await makeImage('./test/fixtures/image/lena.png').toObject()
    const composition = makeImage({width: image.info.width, height: image.info.height * 2})
    await composition.copy(image, {x: 0, y: 0})
    await composition.copy(image, {x: 0, y: image.info.height})
    const actual = await composition.toObject()
    const expected = await makeImage('./test/fixtures/image/lena.stitched.png').toObject()
    assert.ok(
      pixelmatch(actual.data, expected.data, null, expected.info.width, expected.info.height) === 0,
    )
  })
})
