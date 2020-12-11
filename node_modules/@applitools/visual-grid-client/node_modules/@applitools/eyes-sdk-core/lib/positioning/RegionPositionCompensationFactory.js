'use strict'

const BrowserNames = require('../useragent/BrowserNames')
const NullRegionPositionCompensation = require('./NullRegionPositionCompensation')
const SafariRegionPositionCompensation = require('./SafariRegionPositionCompensation')

class RegionPositionCompensationFactory {
  /**
   * @param {UserAgent} userAgent
   * @param {Eyes} eyes
   * @param {Logger} logger
   * @return {RegionPositionCompensation}
   */
  static getRegionPositionCompensation(userAgent, _eyes, _logger) {
    if (userAgent) {
      if (userAgent.getBrowser() === BrowserNames.Safari) {
        return new SafariRegionPositionCompensation()
      }
    }
    return new NullRegionPositionCompensation()
  }
}

module.exports = RegionPositionCompensationFactory
