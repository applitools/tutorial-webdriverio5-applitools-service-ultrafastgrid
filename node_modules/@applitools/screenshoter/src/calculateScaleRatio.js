const VIEWPORT_THRESHOLD = 1
const DOCUMENT_THRESHOLD = 10

function makeCalculateScaleRatio({viewportWidth, documentWidth, pixelRatio}) {
  return function calculateScaleRatio(imageWidth) {
    // If the image's width is the same as the viewport's width or the
    // top level context's width, no scaling is necessary.
    if (
      (imageWidth >= viewportWidth - VIEWPORT_THRESHOLD &&
        imageWidth <= viewportWidth + VIEWPORT_THRESHOLD) ||
      (imageWidth >= documentWidth - DOCUMENT_THRESHOLD &&
        imageWidth <= documentWidth + DOCUMENT_THRESHOLD)
    ) {
      return 1
    }

    const scaledImageWidth = Math.round(imageWidth / pixelRatio)
    return viewportWidth / scaledImageWidth / pixelRatio
  }
}

module.exports = makeCalculateScaleRatio
