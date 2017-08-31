const debug = require('debug')('failing')
console.log('loading failing-spec.js')
console.log(process.env.DEBUG)

describe('failing spec', () => {
  it('A', function () {
    console.log(`in "${this.test.fullTitle()}"`)

    debug('a lot of')
    debug('verbose')
    debug('messages')
    debug('in debug')
    debug('mode in test A')
  })

  it('B', function () {
    console.log(`in "${this.test.fullTitle()}"`)

    debug('a lot of')
    debug('verbose')
    debug('messages')
    debug('in debug')
    debug('mode in test B')
    throw new Error('B fails')
  })
})
