function findPattern(image, pattern) {
  for (let pixel = 0; pixel < image.info.width * image.info.height; ++pixel) {
    if (isPattern(image, pixel, pattern)) {
      return {
        x: (pixel % image.info.width) - pattern.offset,
        y: Math.floor(pixel / image.info.width) - pattern.offset,
      }
    }
  }
  return null
}

function isPattern(image, index, pattern) {
  const roundNumber = pattern.size - Math.floor(pattern.size / 2)
  for (const [chunkIndex, chunkColor] of pattern.mask.entries()) {
    const pixelOffset = index + image.width * pattern.size * chunkIndex
    for (let round = 0; round < roundNumber; ++round) {
      const sideLength = pattern.size - round * 2
      const stepsNumber = sideLength * 4 - 4
      const threshold = Math.min((roundNumber - round) * 10 + 10, 100)
      for (let step = 0; step < stepsNumber; ++step) {
        let pixelIndex = pixelOffset + round + round * image.width

        if (step < sideLength) {
          pixelIndex += step
        } else if (step < sideLength * 2 - 1) {
          pixelIndex += sideLength - 1 + ((step % sideLength) + 1) * image.width
        } else if (step < sideLength * 3 - 2) {
          pixelIndex += (sideLength - 1) * image.width + (sideLength - (step % sideLength) - 1)
        } else {
          pixelIndex += (step % sideLength) * image.width
        }

        const pixelColor = pixelColorAt(image, pixelIndex, threshold)
        if (pixelColor !== chunkColor) {
          return false
        }
      }
    }
  }
  return true
}

function pixelColorAt(image, index, threshold = 0) {
  const channels = image.info.channels
  const r = image.data[index * channels]
  const g = image.data[index * channels + 1]
  const b = image.data[index * channels + 2]
  const rgb = [r, g, b]

  // WHITE
  if (rgb.every(sub => sub >= 255 - threshold)) return 1
  // BLACK
  else if (rgb.every(sub => sub <= threshold)) return 0
  // OTHER
  else return -1
}

module.exports = findPattern
