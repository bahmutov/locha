'use strict'

const Mocha = require('mocha')
const leaveTests = require('leave-tests')
const pluralize = require('pluralize')

const verboseEnvironment = {
  DEBUG: 'failing'
}

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

function runSpecs (onlyTests, ...specs) {
  restoreRequireCache()

  return new Promise((resolve, reject) => {
    const failedTests = []
    const mocha = new Mocha()

    if (hasTestsFilter(onlyTests)) {
      Object.assign(process.env, verboseEnvironment)
      console.log('new DEBUG', process.env.DEBUG)
    }

    specs.forEach(mocha.addFile.bind(mocha))

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

function locha (...specs) {
  runSpecs(null, ...specs)
    .catch(err => {
      const failedTests = err.failedTests
      console.error('Failed first time, rerunning %d tests', failedTests.length)
      return runSpecs(failedTests, ...specs)
    })
    .catch(err => {
      process.exit(err.failedTests.length)
    })
}

module.exports = locha
