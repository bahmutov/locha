function objectFromString (s) {
  const result = {}
  if (!s) {
    return result
  }
  s.split(',').forEach(pair => {
    const [key, value] = pair.split(':')
    result[key] = value
  })
  return result
}

module.exports = { objectFromString }
