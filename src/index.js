'use strict'

const debug = require('debug')('locha')
const Mocha = require('mocha')
const leaveTests = require('leave-tests')
const pluralize = require('pluralize')
const la = require('lazy-ass')
const is = require('check-more-types')

const hasTestsFilter = onlyTests => Array.isArray(onlyTests) && onlyTests.length

function clearAllExtraModules () {
  // current snapshot
  const loadedModules = Object.keys(require.cache)
  return function clearAnyNewModules () {
    Object.keys(require.cache).forEach(moduleName => {
      if (!loadedModules.includes(moduleName)) {
        delete require.cache[moduleName]
      }
    })
  }
}
const restoreRequireCache = clearAllExtraModules()

const isMochaOpts = is.schema({
  timeout: is.maybe.positive,
  reporter: is.maybe.string
})

function runSpecs (extraEnvironment, onlyTests, mochaOpts, ...specs) {
  la(is.object(mochaOpts), 'expected mocha options', mochaOpts)
  la(isMochaOpts(mochaOpts), 'invalid options inside Mocha options', mochaOpts)

  restoreRequireCache()

  return new Promise((resolve, reject) => {
    const failedTests = []
    const mocha = new Mocha()

    if (hasTestsFilter(onlyTests)) {
      Object.assign(process.env, extraEnvironment)
    }

    specs.forEach(mocha.addFile.bind(mocha))

    const reporterOptions = {}
    debug('mocha reporter', mochaOpts.reporter)
    mocha.reporter(mochaOpts.reporter, reporterOptions)

    if (mochaOpts.timeout) {
      mocha.suite.timeout(mochaOpts.timeout)
    }

    if (hasTestsFilter(onlyTests)) {
      mocha.suite.beforeAll(() => leaveTests(onlyTests)(mocha.suite))
    }

    function mochaFinished (failures) {
      console.log(
        'mocha finished with %s',
        pluralize('failure', failures, true)
      )
      if (failures) {
        const msg = pluralize('failure', failures, true)
        const err = new Error(msg)
        err.failedTests = failedTests
        return reject(err)
      } else {
        return resolve()
      }
    }

    const runner = mocha.run(mochaFinished)
    runner.on('fail', function (test, err) {
      failedTests.push(test.fullTitle())
    })
  })
}

function locha (extraEnvironment, mochaOpts, ...specs) {
  return runSpecs(null, null, mochaOpts, ...specs)
    .catch(err => {
      const failedTests = err.failedTests
      if (Array.isArray(failedTests)) {
        console.error(
          'Failed first time, rerunning %s',
          pluralize('test', failedTests.length, true)
        )
        return runSpecs(extraEnvironment, failedTests, mochaOpts, ...specs)
      }
      throw err
    })
    .catch(err => {
      const failedTests = err.failedTests
      if (Array.isArray(failedTests)) {
        return failedTests.length
      }
      throw err
    })
}

module.exports = locha
