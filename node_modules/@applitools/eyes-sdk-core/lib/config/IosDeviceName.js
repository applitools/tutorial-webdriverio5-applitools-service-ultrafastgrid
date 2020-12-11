const Enum = require('../utils/Enum')

/**
 * @typedef {import('../utils/Enum').EnumValues<typeof IosDeviceNames>} IosDeviceName
 */

const IosDeviceNames = Enum('IosDeviceName', {
  /** @type {'iPhone 11 Pro'} */
  iPhone_11_Pro: 'iPhone 11 Pro',
  /** @type {'iPhone 11 Pro Max'} */
  iPhone_11_Pro_Max: 'iPhone 11 Pro Max',
  /** @type {'iPhone 11'} */
  iPhone_11: 'iPhone 11',
  /** @type {'iPhone XR'} */
  iPhone_XR: 'iPhone XR',
  /** @type {'iPhone Xs'} */
  iPhone_XS: 'iPhone Xs',
  /** @type {'iPhone X'} */
  iPhone_X: 'iPhone X',
  /** @type {'iPhone 8'} */
  iPhone_8: 'iPhone 8',
  /** @type {'iPhone 7'} */
  iPhone_7: 'iPhone 7',
  /** @type {'iPad Pro (12.9-inch) (3rd generation)'} */
  iPad_Pro_3: 'iPad Pro (12.9-inch) (3rd generation)',
  /** @type {'iPad (7th generation)'} */
  iPad_7: 'iPad (7th generation)',
  /** @type {'iPad Air (2nd generation)'} */
  iPad_Air_2: 'iPad Air (2nd generation)',
  /** @type {'iPhone 12 Pro Max'} */
  iPhone_12_Pro_Max: 'iPhone 12 Pro Max',
  /** @type {'iPhone 12 Pro'} */
  iPhone_12_Pro: 'iPhone 12 Pro',
  /** @type {'iPhone 12'} */
  iPhone_12: 'iPhone 12',
  /** @type {'iPhone 12 mini'} */
  iPhone_12_mini: 'iPhone 12 mini',
})

module.exports = IosDeviceNames
