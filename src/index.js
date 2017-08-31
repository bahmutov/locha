'use strict'

const debug = require('debug')('locha')
const Mocha = require('mocha')
const leaveTests = require('leave-tests')
const pluralize = require('pluralize')
const la = require('lazy-ass')
const is = require('check-more-types')
const join = require('path').join

const hasTestsFilter = onlyTests => Array.isArray(onlyTests) && onlyTests.length

function restoreRequireCache () {
  Object.keys(require.cache).forEach(moduleName => {
    delete require.cache[moduleName]
  })
}

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

    // load reporters
    const cwd = process.cwd()
    debug('proces.cwd', cwd)
    module.paths.unshift(cwd, join(cwd, 'node_modules'))
    debug('module.paths')
    debug(module.paths)

    let Reporter = null
    try {
      const builtInReporterPath = 'mocha/lib/reporters/' + mochaOpts.reporter
      debug('trying to load built-in? reporter', builtInReporterPath)
      Reporter = require(builtInReporterPath)
      mochaOpts.reporter = builtInReporterPath
      debug('found built-in module', builtInReporterPath)
    } catch (err) {
      try {
        debug('trying to load plain reporter', mochaOpts.reporter)
        Reporter = require(mochaOpts.reporter)
        mochaOpts.reporter = require.resolve(mochaOpts.reporter)
        debug('full reporter path', mochaOpts.reporter)
      } catch (err2) {
        debug(err2.message)
        debug(err2.stack)
        throw new Error('reporter "' + mochaOpts.reporter + '" does not exist')
      }
    }
    if (!Reporter) {
      throw new Error('Could not load reporter ' + mochaOpts.reporter)
    }

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
