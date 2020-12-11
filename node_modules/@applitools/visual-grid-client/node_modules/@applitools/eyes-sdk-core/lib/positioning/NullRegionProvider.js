'use strict'

const Region = require('../geometry/Region')
const RegionProvider = require('./RegionProvider')

class NullRegionProvider extends RegionProvider {
  constructor() {
    super(Region.EMPTY)
  }
}

module.exports = NullRegionProvider
