const debug = require('debug')('failing')

describe('spec-b', () => {
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
  })
})
