const R = require('ramda')

function stringToObject (separator, keyValueSeparator, s) {
  const result = {}
  if (!s) {
    return result
  }
  s.split(separator).forEach(pair => {
    const [key, value] = pair.split(keyValueSeparator)
    result[key] = value
  })
  return result
}

// uses ':' to separate pairs
const objectFromString = R.partial(stringToObject, [',', ':'])

// uses ';' to separate pairs
// uses '=' to separate key from value
// DEBUG=foo:*,bar;LOG=verbose
// will become
// {DEBUG: 'foo:*,bar', LOG: 'verbose'}
const envFromString = R.partial(stringToObject, [';', '='])

module.exports = { objectFromString, envFromString }
