const Driver = require('./src/driver')
const Context = require('./src/context')
const Element = require('./src/element')
const scripts = require('./src/scripts')

function makeDriver(spec, logger, driver) {
  const SpecElement = Element.specialize(spec)
  const SpecContext = Context.specialize({
    ...spec,
    newElement(...args) {
      return new SpecElement(...args)
    },
  })
  const SpecDriver = Driver.specialize({
    ...spec,
    newContext(...args) {
      return new SpecContext(...args)
    },
  })

  return new SpecDriver(logger, driver)
}

exports.makeDriver = makeDriver
exports.Driver = Driver
exports.Context = Context
exports.Element = Element
exports.scripts = scripts
